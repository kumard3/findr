import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json(
        {
          error: error.message,
          code: error.status,
          details: error.cause,
        },
        error.status
      );
    }

    console.error("Unhandled error:", error);
    return c.json(
      {
        error: "Internal server error",
        code: 500,
      },
      500
    );
  }
}
