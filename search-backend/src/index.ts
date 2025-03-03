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
  ValidatedDocument,
} from "./types";
import { db } from "./db";
import { randomUUID } from "crypto";
import { z } from "zod";
import fs from "fs";

interface CustomContext {
  keyInfo: ApiKeyInfo;
}

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

app.use("*", cors());
// app.use("*", errorHandler);
// app.use("*", rateLimiter);
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
  console.log(apiKey, "apiKey");
  if (!apiKey) throw new HTTPException(401, { message: "API key required" });

  const validator = new ApiKeyValidator();
  const keyInfo = await validator.validateKey(
    "sk_4Etu0CEwfh7C5BAHWJnyu8rfgFyn5Tgh"
  );
  c.set("keyInfo", keyInfo);
  await next();
});

app.post("/api/index", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const rawDocument = (await c.req.json()) as ValidatedDocument;
  let documents: z.infer<typeof documentSchema>[];
  let isBulk = false;
  try {
    // if (!keyInfo.permissions.includes("write")) {
    //   throw new HTTPException(403, { message: "Write permission required" });
    // }
    // const singleDoc = await documentSchema.parseAsync(rawDocument);

    const typesenseDocs = {
      ...rawDocument.body,
      id: randomUUID(),
    };

    // Calculate total size and document count
    const totalSize = Buffer.byteLength(JSON.stringify(typesenseDocs), "utf8");
    const docCount = 1;

    // Fetch user with tier info for usage limits
    // const user = await db.user.findUnique({
    //   where: { id: keyInfo.userId },
    //   include: { tier: true },
    // });

    // // Check usage limits
    // const tier = user?.tier || { documentLimit: 1000, storageLimit: 10485760 };
    // if (
    //   (user?.used || 0) + docCount > tier.documentLimit ||
    //   (user?.storage || 0) + totalSize > tier.storageLimit
    // ) {
    //   throw new HTTPException(403, { message: "Usage limit exceeded" });
    // }

    // Save to primary database
    // await db.document.create({
    //   data: {
    //     id: typesenseDocs.id,
    //     userId: keyInfo.userId,
    //     content: { ...typesenseDocs, id: undefined }, // Exclude id from content to avoid duplication
    //   },
    // });

    // Index document(s) in Typesense
    await typesense.indexDocument(
      keyInfo.userId,
      rawDocument.indexName,
      typesenseDocs
    );

    // Log operation and update user usage in a transaction
    // await db.$transaction([
    //   db.usageLog.create({
    //     data: {
    //       userId: keyInfo.userId,
    //       operation: isBulk ? "bulk_index" : "index",
    //       status: "success",
    //       apiKeyId: keyInfo.id,
    //       documentsProcessed: docCount,
    //       dataSize: totalSize,
    //       ipAddress: c.req.header("x-forwarded-for") || "",
    //       userAgent: c.req.header("user-agent") || "",
    //     },
    //   }),
    //   db.user.update({
    //     where: { id: keyInfo.userId },
    //     data: {
    //       used: { increment: docCount },
    //       storage: { increment: totalSize },
    //     },
    //   }),
    // ]);

    return c.json(
      {
        success: true,
        document: typesenseDocs,
      },
      201
    );
  } catch (error) {
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
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Search API
app.get("/api/search", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();

  try {
    const searchParams: SearchParams = {
      ...(c.req.query() as Record<string, string>),
      q: c.req.query("q") || "",
      per_page: Number.parseInt(c.req.query("per_page") || "10"),
      page: Number.parseInt(c.req.query("page") || "1"),
      collection_name: c.req.query("collection_name") || "default",
    };

    const results = await typesense.search(
      keyInfo?.userId,
      searchParams.collection_name,
      searchParams
    );

    // Log search
    await db.usageLog.create({
      data: {
        userId: keyInfo?.userId,
        operation: "search",
        status: "success",
        apiKeyId: keyInfo.id,
        processingTime: results.search_time_ms,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json(results);
  } catch (error) {
    // Log error
    await db.usageLog.create({
      data: {
        userId: keyInfo?.userId,
        operation: "search",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Search failed",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(400, {
      message: error instanceof Error ? error.message : "Search error",
    });
  }
});
// Delete document endpoint
app.delete("/api/documents/:id", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const documentId = c.req.param("id");

  try {
    if (!keyInfo.permissions.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }

    await typesense.client
      .collections(`collection_${keyInfo.userId}`)
      .documents(documentId)
      .delete();

    await db.usageLog.create({
      data: {
        userId: keyInfo.userId,
        operation: "delete",
        status: "success",
        apiKeyId: keyInfo.id,
        documentsProcessed: 1,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json({ success: true });
  } catch (error) {
    await db.usageLog.create({
      data: {
        userId: keyInfo.userId,
        operation: "delete",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Delete failed",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Delete failed",
    });
  }
});

// Collection stats endpoint
app.get("/api/stats", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();

  try {
    const stats = await typesense.getCollectionStats(keyInfo.userId);
    const usage = await db.user.findUnique({
      where: { id: keyInfo.userId },
      select: { used: true, storage: true,  },
    });

    return c.json({
      collection: stats,
      usage: usage || { used: 0, storage: 0, limit: 0 },
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Failed to get stats",
    });
  }
});

// Usage statistics endpoint
app.get("/api/usage", async (c) => {
  const keyInfo = c.get("keyInfo");

  try {
    // Get usage logs
    const logs = await db.usageLog.findMany({
      where: { userId: keyInfo.userId },
      orderBy: {  },
      take: 100, // Limit to last 100 entries
    });

    // Get aggregated stats
    const stats = await db.usageLog.groupBy({
      by: ["operation", "status"],
      where: { userId: keyInfo.userId },
      _count: true,
    });

    // Get user limits and current usage
    const user = await db.user.findUnique({
      where: { id: keyInfo.userId },
      select: {
        used: true,
        storage: true,
      },
    });

    return c.json({
      logs,
      stats,
      limits: user || { used: 0, storage: 0, limit: 0 },
    });
  } catch (error) {
    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to fetch usage data",
    });
  }
});

const port = process.env.PORT || 8000;
Bun.serve({ port, fetch: app.fetch });

export default app;
