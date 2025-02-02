import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { env } from "@/env";
import { TRPCClientError } from "@trpc/client";
import typesense from "@/lib/typesense";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["search", "write", "admin"]),
  expiresIn: z.number().optional(), // days
  allowedOperations: z.array(z.enum(["search", "write", "delete"])),
  ipRestrictions: z.array(z.string()).optional(),
  permissions: z.array(z.enum(["search", "write", "delete"])).optional(),
});

export const userRouter = createTRPCRouter({
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const userData = await ctx.db.user.findMany({
      include: {
        apiKeys: true,
        usageLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    return userData;
  }),

  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await ctx.db.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          limit: 1000, // Default limit
          used: 0,
          storage: 0,
        },
      });
      return newUser;
    }),

  generateApiKey: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, type, allowedOperations, ipRestrictions, expiresIn } =
        input;
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCClientError("User not authenticated");
      }

      const keyId = nanoid(32);
      const apiKey = await ctx.db.apiKey.create({
        data: {
          value: keyId, // Add required 'value' field
          id: keyId,
          name,
          type,
          userId,
          permissions: allowedOperations,
          ipRestrictions: ipRestrictions || [],
          expiresAt: expiresIn
            ? new Date(Date.now() + expiresIn * 86400000)
            : null,
          rateLimit: type === "admin" ? 1000 : 100,
          requestCount: 0,
        },
      });

      return apiKey;
    }),

  validateApiKey: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const apiKey = await ctx.db.apiKey.findUnique({
        where: { id: input.keyId },
        include: { user: true },
      });

      if (!apiKey) {
        throw new TRPCClientError("Invalid API key");
      }

      if (apiKey.requestCount >= apiKey.rateLimit) {
        throw new TRPCClientError("Rate limit exceeded");
      }

      await ctx.db.apiKey.update({
        where: { id: input.keyId },
        data: { requestCount: { increment: 1 } },
      });

      return {
        id: apiKey.id,
        userId: apiKey.userId,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        requestCount: apiKey.requestCount + 1,
      };
    }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new TRPCClientError("User not authenticated");
    }

    const [user, usageLogs, apiKeys] = await Promise.all([
      ctx.db.user.findUnique({
        where: { id: userId },
        select: { used: true, storage: true, limit: true },
      }),
      ctx.db.usageLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      ctx.db.apiKey.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const stats = await ctx.db.usageLog.groupBy({
      by: ["operation", "status"],
      where: { userId },
      _count: true,
    });

    return {
      user,
      usageLogs,
      apiKeys,
      stats,
    };
  }),

  deleteApiKey: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCClientError("User not authenticated");
      }

      await ctx.db.apiKey.delete({
        where: {
          id: input.keyId,
          userId, // Ensure the key belongs to the user
        },
      });

      return { success: true };
    }),
});

async function ensureCollectionExists(collectionName: string) {
  try {
    const collections = await typesense.collections().retrieve();
    const collectionExists = collections.some(
      (collection) => collection.name === collectionName
    );
    if (!collectionExists) {
      await typesense.collections().create({
        name: collectionName,
        fields: [{ name: ".*", type: "auto" }],
      });
      console.log(`Collection "${collectionName}" created successfully.`);
    }
  } catch (error) {
    console.error("Error ensuring collection exists:", error);
    throw new Error("Failed to ensure collection exists.");
  }
}
