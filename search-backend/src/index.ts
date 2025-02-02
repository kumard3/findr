import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ApiKeyValidator } from "./services/apiKeyValidator";
import { TypesenseService } from "./services/typesenseService";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

import { documentSchema, type Env, type SearchParams } from "./types";
import { db } from "./db";
// import sharp from "sharp";

interface CustomContext {
  keyInfo: {
    user: {
      id: string;
    };
    allowedOperations: string[];
    id: string;
  };
}

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

// Global Middleware
app.use("*", cors());
app.use("*", errorHandler);
app.use("*", rateLimiter);

// API key validation middleware
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
  console.log(apiKey, "apiKey");
  if (!apiKey) {
    throw new HTTPException(401, { message: "API key required" });
  }

  const validator = new ApiKeyValidator();
  try {
    const keyInfo = await validator.validateKey(apiKey);
    c.set("keyInfo", keyInfo);
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      message: error instanceof Error ? error.message : "Invalid API key",
    });
  }
});

// Index API
app.post("/api/index", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();

  try {
    // Check permissions
    if (!keyInfo.allowedOperations.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }

    // Validate document
    const rawDocument = await c.req.json();
    const document = await documentSchema.parseAsync(rawDocument);
    const documentSize = JSON.stringify(document).length;

    // Index document
    const result = await typesense.indexDocument(keyInfo.user.id, document);

    // Log operation
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "index",
        status: "success",
        apiKeyId: keyInfo.id,
        documentsProcessed: 1,
        dataSize: documentSize,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    // Update user usage
    await db.user.update({
      where: { id: keyInfo.user.id },
      data: {
        used: { increment: 1 },
        storage: { increment: documentSize },
      },
    });

    return c.json({
      success: true,
      document: result,
    });
  } catch (error) {
    // Log error
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "index",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

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
      q: c.req.query("q") || "",
      query_by: c.req.query("query_by") || "content",
      per_page: Number.parseInt(c.req.query("per_page") || "10"),
      page: Number.parseInt(c.req.query("page") || "1"),
      collection_name: c.req.query("collection_name") || "default",
    };

    const results = await typesense.search(keyInfo.user.id, searchParams);

    // Log search
    await db.usageLog.create({
      data: {
        userId: keyInfo?.user?.id,
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
        userId: keyInfo.user.id,
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
    if (!keyInfo.allowedOperations.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }

    await typesense.client
      .collections(`collection_${keyInfo.user.id}`)
      .documents(documentId)
      .delete();

    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
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
        userId: keyInfo.user.id,
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
    const stats = await typesense.getCollectionStats(keyInfo.user.id);
    const usage = await db.user.findUnique({
      where: { id: keyInfo.user.id },
      select: { used: true, storage: true, limit: true },
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
      where: { userId: keyInfo.user.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 entries
    });

    // Get aggregated stats
    const stats = await db.usageLog.groupBy({
      by: ["operation", "status"],
      where: { userId: keyInfo.user.id },
      _count: true,
    });

    // Get user limits and current usage
    const user = await db.user.findUnique({
      where: { id: keyInfo.user.id },
      select: {
        used: true,
        storage: true,
        limit: true,
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

// List all collections
app.get("/api/collections", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  console.log(keyInfo, "keyInfo");
  try {
    const collections = await typesense.client.collections().retrieve();
    const userCollections = collections.filter((collection) =>
      collection.name.startsWith(`collection_${keyInfo.user.id}`)
    );

    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "list_collections",
        status: "success",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json(userCollections);
  } catch (error) {
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "list_collections",
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to list collections",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to list collections",
    });
  }
});

// List all documents in a collection
app.get("/api/collections/:collectionName/documents", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const collectionName = c.req.param("collectionName");

  try {
    const documents = await typesense.client
      .collections(collectionName)
      .documents()
      .search({
        q: "*",
        per_page: 250,
      });

    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "list_documents",
        status: "success",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json(documents);
  } catch (error) {
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "list_documents",
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to list documents",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to list documents",
    });
  }
});

// Delete a collection
app.delete("/api/collections/:collectionName", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const collectionName = c.req.param("collectionName");

  try {
    if (!keyInfo.allowedOperations.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }

    await typesense.client.collections(collectionName).delete();

    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "delete_collection",
        status: "success",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json({ success: true });
  } catch (error) {
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "delete_collection",
        status: "failed",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to delete collection",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to delete collection",
    });
  }
});

// Delete multiple documents
app.delete("/api/collections/:collectionName/documents", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const collectionName = c.req.param("collectionName");

  try {
    if (!keyInfo.allowedOperations.includes("write")) {
      throw new HTTPException(403, { message: "Write permission required" });
    }

    const { documentIds } = await c.req.json();
    if (!Array.isArray(documentIds)) {
      throw new HTTPException(400, { message: "documentIds must be an array" });
    }

    const deletePromises = documentIds.map((id) =>
      typesense.client.collections(collectionName).documents(id).delete()
    );

    await Promise.all(deletePromises);

    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "bulk_delete_documents",
        status: "success",
        apiKeyId: keyInfo.id,
        documentsProcessed: documentIds.length,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    return c.json({ success: true, deletedCount: documentIds.length });
  } catch (error) {
    await db.usageLog.create({
      data: {
        userId: keyInfo.user.id,
        operation: "bulk_delete_documents",
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to delete documents",
        apiKeyId: keyInfo.id,
        ipAddress: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    });

    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to delete documents",
    });
  }
});

const port = Bun.env.PORT || 8000;
Bun.serve({
  port,
  fetch: app.fetch,
});
export default app;
