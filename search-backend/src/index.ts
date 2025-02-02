import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ApiKeyValidator } from "./services/apiKeyValidator";
import { TypesenseService } from "./services/typesenseService";

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

// Middleware
app.use("*", cors());

// API key validation middleware
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
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
  const typesense = new TypesenseService(c.env);

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
  const typesense = new TypesenseService(c.env);

  try {
    const searchParams: SearchParams = {
      q: c.req.query("q") || "",
      query_by: c.req.query("query_by") || "content",
      per_page: Number.parseInt(c.req.query("per_page") || "10"),
      page: Number.parseInt(c.req.query("page") || "1"),
      collection_name: c.req.query("collection_name") || "default",
    };
    console.log(searchParams)
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
// app.get("/image", async (c) => {
//   const { width, height, quality, format, url } = c.req.query();

//   try {
//     const imageResponse = await fetch(url);
//     const imageBuffer = await imageResponse.arrayBuffer();

//     const transformer = sharp(Buffer.from(imageBuffer))
//       .resize(
//         width ? Number.parseInt(width) : undefined,
//         height ? Number.parseInt(height) : undefined,
//         { fit: "inside" }
//       )
//       .toFormat("webp", {
//         compressionLevel: 6,
//       });

//     // if (quality) {
//     //   transformer = transformer.quality(parseInt(quality));
//     // }

//     const processedImage = await transformer.toBuffer();

//     c.header("Content-Type", `image/${format || "webp"}`);
//     c.header("Cache-Control", "public, max-age=31536000");

//     return c.body(processedImage);
//   } catch (error) {
//     return c.json({ error: "Image processing failed" }, 500);
//   }
// });
const port = Bun.env.PORT || 8000;
Bun.serve({
  port,
  fetch: app.fetch,
});
export default app;
