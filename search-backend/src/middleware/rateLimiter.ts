import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";

const WINDOW_SIZE = 60 * 1000; // 1 minute in milliseconds

export async function rateLimiter(c: Context, next: Next) {
  const apiKey = c.req.header("x-api-key");
  if (!apiKey) {
    throw new HTTPException(401, { message: "API key required" });
  }

  try {
    const keyInfo = await db.apiKey.findUnique({
      where: { id: apiKey },
      include: { user: true },
    });

    if (!keyInfo) {
      throw new HTTPException(401, { message: "Invalid API key" });
    }

    const now = Date.now();
    const requestCount = await db.usageLog.count({
      where: {
        apiKeyId: apiKey,
        createdAt: {
          gte: new Date(now - WINDOW_SIZE),
        },
      },
    });

    if (requestCount >= keyInfo.rateLimit) {
      throw new HTTPException(429, { message: "Rate limit exceeded" });
    }

    await next();
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
