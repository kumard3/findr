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
  InputDocument,
  SingleCollectionDatatype,
} from "./types";
import { db } from "./db";
import { randomUUID } from "crypto";
import { serveStatic } from "hono/bun";

import { z } from "zod";
import fs from "fs";
import { indexQueue } from "./services/worker";
import { swaggerUI } from "@hono/swagger-ui";

interface CustomContext {
  keyInfo: ApiKeyInfo;
}

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();
// Redis connection (adjust based on your setup)

app.use("*", cors());

app.use("*", async (c, next) => {
  if (c.req.path === "/") {
    return c.redirect("/doc");
  }
  if (c.req.path.includes("/doc") || c.req.path.includes("/static/")) {
    await next();
    return;
  }
  const apiKey = c.req.header("x-api-key");
  if (!apiKey) throw new HTTPException(401, { message: "API key required" });

  const validator = new ApiKeyValidator();
  const keyInfo = await validator.validateKey(apiKey);
  c.set("keyInfo", keyInfo);
  await next();
});

app.post("/api/index", async (c) => {
  try {
    const keyInfo = c.get("keyInfo");

    const rawDocument = (await c.req.json()) as InputDocument;
    let documents: SingleCollectionDatatype | SingleCollectionDatatype[];
    let isBulk = false;

    if (Array.isArray(rawDocument.body)) {
      const modifiedBody = rawDocument.body.map((doc) => {
        return {
          id: randomUUID(),
          collection_name: `collection_${keyInfo.userId}_${rawDocument.indexName}`,
          indexed_at: Date.now(),
          user_id: keyInfo.userId,
          document: doc,
        };
      });
      documents = modifiedBody;
      isBulk = true;
    } else {
      const modifiedBody = {
        id: randomUUID(),
        collection_name: `collection_${keyInfo.userId}_${rawDocument.indexName}`,
        indexed_at: Date.now(),
        user_id: keyInfo.userId,
        document: rawDocument.body,
      };
      documents = [modifiedBody];
    }
    // Handle single or bulk documents
    await indexQueue.add("indexJob", {
      documents,
    });

    // Return a response immediately (job is queued)
    return c.json(
      {
        success: true,
        message: isBulk ? "Bulk indexing job queued" : "Indexing job queued",
      },
      202 // 202 Accepted
    );
  } catch (error) {
    // Handle validation or other errors
    throw new HTTPException(400, {
      message: error instanceof Error ? error.message : "Invalid request data",
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
app.get("/api/stats", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();
  const stats = await typesense.getCollectionStats(keyInfo.userId);
  return c.json(stats);
});

// Collection stats endpoint
app.get("/api/stats", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService();

  try {
    const stats = await typesense.getCollectionStats(keyInfo.userId);
    const usage = await db.user.findUnique({
      where: { id: keyInfo.userId },
      select: { used: true, storage: true },
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
      orderBy: {},
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
}); // Usage statistics endpoint
app.get("/api/collections", async (c) => {
  const keyInfo = c.get("keyInfo");

  try {
    const collections = await db.collection.findMany({
      where: { userId: keyInfo.userId },
    });

    return c.json({ collections });
  } catch (error) {
    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to fetch usage data",
    });
  }
});
app.get("/api/documents/:collectionName", async (c) => {
  try {
    const collectionName = c.req.param("collectionName");
    const typesense = new TypesenseService();
    const documents = await typesense.getDocuments(collectionName);
    console.log("documents", documents);
    return c.json({ documents });
  } catch (error) {
    console.log("error", error);
    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Failed to fetch documents",
    });
  }
});

app.use("/static/*", serveStatic({ root: "./" }));

app.get("/doc", swaggerUI({ url: "/static/openapi.yaml" }));

const port = process.env.PORT || 8000;
Bun.serve({ port, fetch: app.fetch });

export default app;
