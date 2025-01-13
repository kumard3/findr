import { PrismaClient } from "@prisma/client";
import type {  ApiKeyWithUser } from "../types";

export class ApiKeyValidator {
  private prisma: PrismaClient;
  private cache: Map<string, { info: ApiKeyWithUser; timestamp: number }>;

  constructor() {
    this.prisma = new PrismaClient();
    this.cache = new Map();
  }

  async validateKey(apiKey: string): Promise<ApiKeyWithUser> {
    const cached = this.cache.get(apiKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.info;
    }

    const keyInfo = await this.prisma.apiKey.findUnique({
      where: { value: apiKey },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            email: true,
            updatedAt: true,
            password: true,
            provider: true,
            providerId: true,
            tier: true,
            limit: true,
            used: true,
            storage: true,
            trialEndsAt: true,
            customerId: true,
            subscriptionId: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!keyInfo || keyInfo.status !== "active") {
      throw new Error("Invalid or inactive API key");
    }

    if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
      throw new Error("API key expired");
    }

    // Update lastUsed
    await this.prisma.apiKey.update({
      where: { id: keyInfo.id },
      data: { lastUsed: new Date() },
    });

    this.cache.set(apiKey, { info: keyInfo, timestamp: Date.now() });
    return keyInfo;
  }

  async checkOperationAllowed(
    keyInfo: ApiKeyWithUser,
    operation: string
  ): Promise<boolean> {
    return keyInfo.allowedOperations.includes(operation);
  }

  async checkUserLimits(keyInfo: ApiKeyWithUser): Promise<void> {
    const { user } = keyInfo;

    if (user.used >= user.limit) {
      throw new Error(
        `Usage limit exceeded. Tier: ${user.tier}, Limit: ${user.limit}`
      );
    }

    // Check tier-specific limits from Tier model
    const tierLimits = await this.prisma.tier.findUnique({
      where: { name: user.tier },
    });

    if (tierLimits) {
      if (user.storage >= tierLimits.storageLimit) {
        throw new Error("Storage limit exceeded");
      }
    }
  }
}
