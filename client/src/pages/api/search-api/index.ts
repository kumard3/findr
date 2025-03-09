import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const ApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["search", "write", "admin"]),
  expiresIn: z.number().optional(),
  allowedOperations: z.array(z.enum(["search", "write", "delete"])),
  ipRestrictions: z.array(z.string()).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
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

    if (key.requestCount >= key.rateLimit) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    // Update request count
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        requestCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    const data = ApiKeySchema.parse(req.body);

    // Check user's tier limits
    const user = await prisma.user.findUnique({
      where: { id: key.userId },
      include: {
        _count: {
          select: { apiKeys: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tierLimits = await prisma.tier.findUnique({
      where: { name: user.tier },
    });

    if (!tierLimits) {
      return res.status(404).json({ error: "Tier not found" });
    }

    if (user._count.apiKeys >= tierLimits.apiKeys) {
      return res
        .status(403)
        .json({ error: `API key limit reached for ${user.tier} tier` });
    }

    const newKey = await prisma.apiKey.create({
      data: {
        value: `sk_${nanoid(32)}`,
        name: data.name,
        type: data.type,
        userId: key.userId,
        status: "active",
        allowedOperations: data.allowedOperations,
        ipRestrictions: data.ipRestrictions || [],
        expiresAt: data.expiresIn
          ? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000)
          : null,
        rateLimit: data.type === "admin" ? 1000 : 100,
      },
    });

    return res.status(200).json({
      id: newKey.id,
      value: newKey.value,
      name: newKey.name,
      type: newKey.type,
      createdAt: newKey.createdAt,
      expiresAt: newKey.expiresAt,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
