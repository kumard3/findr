import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const UsageSchema = z.object({
  documentsProcessed: z.number(),
  dataSize: z.number(),
  requestCount: z.number(),
  storageUsed: z.number(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    const key = await prisma.apiKey.findFirst({
      where: {
        value: apiKey,
        status: "active",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!key) {
      return res.status(401).json({ error: "Invalid or expired API key" });
    }

    // Increment request count
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        requestCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    const [user, usageLogs, apiKeys] = await Promise.all([
      prisma.user.findUnique({
        where: { id: key.userId },
        select: { used: true, storage: true, limit: true },
      }),
      prisma.usageLog.findMany({
        where: { userId: key.userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.apiKey.findMany({
        where: { userId: key.userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const stats = await prisma.usageLog.groupBy({
      by: ["operation", "status"],
      where: { userId: key.userId },
      _count: true,
    });

    return res.status(200).json({
      usage: UsageSchema.parse({
        documentsProcessed: user.used,
        dataSize: user.storage,
        requestCount: usageLogs.length,
        storageUsed: user.storage,
      }),
      logs: usageLogs,
      apiKeys,
      stats,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
