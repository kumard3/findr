import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ApiKeyValidator } from "./services/apiKeyValidator";
import { TypesenseService } from "./services/typesenseService";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import {
  documentSchema,
  bulkDocumentSchema,
  type ApiKeyInfo,
  type Env,
  type SearchParams,
} from "./types";
import { db } from "./db";
import { randomUUID } from "crypto";
import { z } from "zod";
import fs from "fs";
// Define custom context for Hono variables
interface CustomContext {
  keyInfo: ApiKeyInfo;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

// Middleware Setup
app.use("*", cors());
app.use("*", errorHandler);
// app.use("*", rateLimiter);
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
  console.log(apiKey, "apiKey");
  if (!apiKey) throw new HTTPException(401, { message: "API key required" });

  const validator = new ApiKeyValidator();
  const keyInfo = await validator.validateKey(apiKey);
  c.set("keyInfo", keyInfo);
  await next();
});

// Define schemas for validation

// Updated /api/index endpoint
app.post("/api/index", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const rawDocument = await c.req.json();
  let documents: z.infer<typeof documentSchema>[];
  let isBulk = false;
  try {
    // Check permissions
    if (!keyInfo.permissions.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }


    if (Array.isArray(rawDocument)) {
      documents = await bulkDocumentSchema.parseAsync(rawDocument);
      isBulk = true;
    } else {
      const singleDoc = await documentSchema.parseAsync(rawDocument);
      documents = [singleDoc];
    }

    // Generate IDs and prepare documents for indexing
    const typesenseDocs = documents.map((doc) => ({
      id: randomUUID(),
      content: doc.content,
    }));
    console.log(typesenseDocs, "typesenseDocs");
    // Calculate total size and document count
    const totalSize = typesenseDocs.reduce(
      (sum, doc) => sum + Buffer.byteLength(JSON.stringify(doc), "utf8"),
      0
    );
    const docCount = typesenseDocs.length;

    // Fetch user with tier info for usage limits
    const user = await db.user.findUnique({
      where: { id: keyInfo.userId },
      include: { tier: true },
    });
    console.log(user, "user");
    // Check usage limits
    const tier = user?.tier || { documentLimit: 1000, storageLimit: 10485760 }; // Default limits
    if (
      user?.used + docCount > tier.documentLimit ||
      user?.storage + totalSize > tier.storageLimit
    ) {
      throw new HTTPException(403, { message: "Usage limit exceeded" });
    }

    // Save to primary database
    await db.document.createMany({
      data: typesenseDocs.map((doc) => ({
        id: doc.id,
        userId: keyInfo.userId,
        content: doc.content,
      })),
    });

    // Index document(s) in Typesense
    await typesense.indexDocument(keyInfo.userId, typesenseDocs);

    // Log operation and update user usage in a transaction
    await db.$transaction([
      db.usageLog.create({
        data: {
          userId: keyInfo.userId,
          operation: isBulk ? "bulk_index" : "index",
          status: "success",
          apiKeyId: keyInfo.id,
          documentsProcessed: docCount,
          dataSize: totalSize,
          ipAddress: c.req.header("x-forwarded-for") || "",
          userAgent: c.req.header("user-agent") || "",
        },
      }),
      db.user.update({
        where: { id: keyInfo.userId },
        data: {
          used: { increment: docCount },
          storage: { increment: totalSize },
        },
      }),
    ]);

    return c.json(
      {
        success: true,
        document: isBulk ? typesenseDocs : typesenseDocs[0], // Return array for bulk, single object otherwise
      },
      201
    );
  } catch (error) {
    // Log error
    await db.usageLog.create({
      data: {
        userId: keyInfo.userId,
        operation: Array.isArray(rawDocument) ? "bulk_index" : "index",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for") || "",
        userAgent: c.req.header("user-agent") || "",
      },
    });
    fs.writeFileSync("error.json", JSON.stringify(error, null, 2));
    console.log(error, "error");
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Endpoint: Bulk Index Documents
app.post("/api/bulk-index", async (c) => {
  const { keyInfo } = c.var;
  if (!keyInfo.permissions.includes("write")) {
    throw new HTTPException(403, { message: "Write permission required" });
  }

  const rawDocuments = await c.req.json();
  const documents = await bulkDocumentSchema.parseAsync(rawDocuments); // Type: { content: string }[]

  // Prepare documents with IDs
  const typesenseDocs = documents.map((doc) => ({
    id: randomUUID(),
    content: doc.content,
  }));
  const totalSize = typesenseDocs.reduce(
    (sum, doc) => sum + Buffer.byteLength(JSON.stringify(doc), "utf8"),
    0
  );
  const docCount = typesenseDocs.length;

  // Check usage limits
  const user = await db.user.findUniqueOrThrow({
    where: { id: keyInfo.userId },
    include: { tier: true },
  });
  if (
    user.used + docCount > (user.tier?.documentLimit || 1000) ||
    user.storage + totalSize > (user.tier?.storageLimit || 10485760)
  ) {
    throw new HTTPException(403, { message: "Usage limit exceeded" });
  }

  // Save to primary database
  await db.document.createMany({
    data: typesenseDocs.map((doc) => ({
      id: doc.id,
      userId: keyInfo.userId,
      content: doc.content,
    })),
  });

  // Index in Typesense
  const typesense = new TypesenseService();
  await typesense.indexDocument(keyInfo.userId, typesenseDocs);

  // Update usage logs and user metrics
  await db.$transaction([
    db.usageLog.create({
      data: {
        userId: keyInfo.userId,
        apiKeyId: keyInfo.id,
        operation: "bulk_index",
        status: "success",
        documentsProcessed: docCount,
        dataSize: totalSize,
        ipAddress: c.req.header("x-forwarded-for") || "",
        userAgent: c.req.header("user-agent") || "",
      },
    }),
    db.user.update({
      where: { id: keyInfo.userId },
      data: {
        used: { increment: docCount },
        storage: { increment: totalSize },
      },
    }),
  ]);

  return c.json({ success: true, documents: typesenseDocs }, 201);
});

// Endpoint: Delete a Document
app.delete("/api/documents/:id", async (c) => {
  const { keyInfo } = c.var;
  if (!keyInfo.permissions.includes("write")) {
    throw new HTTPException(403, { message: "Write permission required" });
  }

  const documentId = c.req.param("id");

  // Delete from primary database
  const deleted = await db.document.deleteMany({
    where: { id: documentId, userId: keyInfo.userId },
  });
  if (deleted.count === 0) {
    throw new HTTPException(404, { message: "Document not found" });
  }

  // Delete from Typesense
  const typesense = new TypesenseService();
  await typesense.client
    .collections(`collection_${keyInfo.userId}`)
    .documents(documentId)
    .delete();

  // Log the operation
  await db.usageLog.create({
    data: {
      userId: keyInfo.userId,
      apiKeyId: keyInfo.id,
      operation: "delete",
      status: "success",
      documentsProcessed: 1,
      ipAddress: c.req.header("x-forwarded-for") || "",
      userAgent: c.req.header("user-agent") || "",
    },
  });

  return c.json({ success: true });
});

// Endpoint: Search Documents
app.get("/api/search", async (c) => {
  const { keyInfo } = c.var;
  if (!keyInfo.permissions.includes("search")) {
    throw new HTTPException(403, { message: "Search permission required" });
  }

  const searchParams: SearchParams = {
    q: c.req.query("q") || "",
    query_by: c.req.query("query_by") || "content",
    per_page: Math.min(parseInt(c.req.query("per_page") || "10"), 100),
    page: parseInt(c.req.query("page") || "1"),
    collection_name:
      c.req.query("collection_name") || `collection_${keyInfo.userId}`,
  };

  const typesense = new TypesenseService();
  const results = await typesense.search(keyInfo.userId, searchParams);

  // Log the search operation
  await db.usageLog.create({
    data: {
      userId: keyInfo.userId,
      apiKeyId: keyInfo.id,
      operation: "search",
      status: "success",
      processingTime: results.search_time_ms,
      ipAddress: c.req.header("x-forwarded-for") || "",
      userAgent: c.req.header("user-agent") || "",
    },
  });

  return c.json(results);
});

// Endpoint: Usage Statistics
app.get("/api/usage", async (c) => {
  const { keyInfo } = c.var;

  const [logs, stats, user] = await db.$transaction([
    db.usageLog.findMany({
      where: { userId: keyInfo.userId },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
    db.usageLog.groupBy({
      by: ["operation", "status"],
      where: { userId: keyInfo.userId },
      _count: {
        _all: true,
      },
      orderBy: {
        operation: "asc",
        status: "asc",
      },
    }),
    db.user.findUniqueOrThrow({
      where: { id: keyInfo.userId },
      select: { used: true, storage: true, tier: true },
    }),
  ]);

  return c.json({
    logs,
    stats,
    limits: {
      used: user.used,
      storage: user.storage,
      documentLimit: user.tier?.documentLimit || 1000,
      storageLimit: user.tier?.storageLimit || 10485760,
    },
  });
});

// Start the Server
const port = process.env.PORT || 8000;
Bun.serve({ port, fetch: app.fetch });

export default app;
