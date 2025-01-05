import { PrismaClient } from "@prisma/client";

export class UsageManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async trackUsage(userId: string, size: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        used: { increment: 1 },
        storage: { increment: size }
      }
    });
  }

  async checkLimits(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { collections: true }
        }
      }
    });

    if (!user) throw new Error("User not found");

    const tier = await this.prisma.tier.findUnique({
      where: { name: user.tier }
    });

    if (!tier) throw new Error("Tier not found");

    if (user.used >= tier.documentLimit) {
      throw new Error("Document limit exceeded");
    }

    if (user.storage >= tier.storageLimit) {
      throw new Error("Storage limit exceeded");
    }

    if (user._count.collections >= tier.collections) {
      throw new Error("Collection limit exceeded");
    }
  }
}
