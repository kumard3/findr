import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserManager } from "../services/userManager";

export const authMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header("x-api-key");

  if (!apiKey) {
    throw new HTTPException(401, { message: "API key missing" });
  }

  const userManager = new UserManager(c.env);
  const userInfo = await userManager.validateUser(apiKey);

  if (!userInfo) {
    throw new HTTPException(401, { message: "Invalid API key" });
  }

  c.set("userInfo", userInfo);
  await next();
};
