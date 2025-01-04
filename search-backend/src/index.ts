// import { Hono } from 'hono'

// const app = new Hono()

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

// export default app
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ApiKeyValidator } from "./services/apiKeyValidator";
import { TypesenseService } from "./services/typesenseService";
import { errorHandler } from "./middleware/errorHandler";
import type { Env, SearchParams } from "./types";
import { UsageLogger } from "./services/usageLogger";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", cors());
app.use("*", errorHandler);

// Validate API key for all routes
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
  if (!apiKey) {
    throw new HTTPException(401, { message: "API key required" });
  }

  const validator = new ApiKeyValidator();
  try {
    const keyInfo = await validator.validateKey(apiKey);
    const withinLimit = await validator.checkRateLimit(keyInfo);

    if (!withinLimit) {
      throw new HTTPException(429, {
        message: "Rate limit exceeded",
        cause: { limit: keyInfo.rateLimit, window: "1 minute" },
      });
    }

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
  const validator = new ApiKeyValidator();
  const logger = new UsageLogger();

  // Validate operation permission
  if (!(await validator.checkOperationAllowed(keyInfo, "write"))) {
    throw new HTTPException(403, { message: "Write permission required" });
  }

  // Check user limits
  await validator.checkUserLimits(keyInfo);

  try {
    const document = await c.req.json();
    const documentSize = JSON.stringify(document).length;

    // Index document
    const typesense = new TypesenseService(c.env);
    const result = await typesense.indexDocument(keyInfo.user.id, document);

    // Log successful operation
    await logger.logOperation({
      userId: keyInfo.user.id,
      operation: "index",
      status: "success",
      apiKeyId: keyInfo.id,
      metrics: {
        documentsProcessed: 1,
        dataSize: documentSize,
      },
      request: c.req,
    });

    // Update collection stats
    if (result.collectionId) {
      await logger.updateCollectionStats(result.collectionId, documentSize);
    }

    return c.json({
      success: true,
      document: result,
      usage: {
        used: keyInfo.user.used + 1,
        limit: keyInfo.user.limit,
        storage: keyInfo.user.storage + documentSize,
      },
    });
  } catch (error) {
    // Log failed operation
    await logger.logOperation({
      userId: keyInfo.user.id,
      operation: "index",
      status: "failed",
      apiKeyId: keyInfo.id,
      error: error as Error,
      request: c.req,
    });

    throw error;
  }
});

// Search API
app.get("/api/search", async (c) => {
  const keyInfo = c.get("keyInfo");
  const typesense = new TypesenseService(c.env);

  const searchParams: SearchParams = {
    q: c.req.query("q") || "",
    query_by: c.req.query("query_by") || "_all",
    per_page: parseInt(c.req.query("per_page") || "10"),
    page: parseInt(c.req.query("page") || "1"),
    facet_by: c.req.query("facet_by"),
    sort_by: c.req.query("sort_by"),
  };

  try {
    const results = await typesense.search(keyInfo.userId, searchParams);
    return c.json(results);
  } catch (error) {
    throw new HTTPException(400, {
      message: "Search error",
      cause: error,
    });
  }
});

export default app;
