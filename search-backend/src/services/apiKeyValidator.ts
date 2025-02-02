import { db } from "../db";
import type { ApiKeyWithUser } from "../types";

export class ApiKeyValidator {
  async validateKey(keyId: string) {
    const apiKey = await db.apiKey.findUnique({
      where: { value: keyId },
      include: { user: true },
    });
console.log(apiKey,"")
    if (!apiKey) {
      throw new Error("Invalid API key");
    }

    if (apiKey.requestCount >= apiKey.rateLimit) {
      throw new Error("Rate limit exceeded");
    }

    // Update request count
    await db.apiKey.update({
      where: { value: keyId },
      data: { requestCount: { increment: 1 } },
    });

    return {
      id: apiKey.id,
      user: apiKey.user,
      allowedOperations: apiKey.allowedOperations,
    };
  }
}
