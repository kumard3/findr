import { db } from "../db";
import type { ApiKeyInfo } from "../types";

export class ApiKeyValidator {
  async validateKey(keyId: string): Promise<ApiKeyInfo> {
    const apiKey = await db.apiKey.findUnique({
      where: { value: keyId },
      include: { user: true },
    });

    if (!apiKey) {
      throw new Error("Invalid API key");
    }

    // if (apiKey.requestCount >= apiKey.rateLimit) {
    //   throw new Error("Rate limit exceeded");
    // }

    // Update request count
    await db.apiKey.update({
      where: { value: keyId },
      data: { requestCount: { increment: 1 } },
    });

    return {
      id: apiKey.id,
      userId: apiKey.userId,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit,
      requestCount: apiKey.requestCount + 1, // Reflect the incremented count
    };
  }
}