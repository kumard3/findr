// src/server/api/routers/apiKey.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["search", "write", "admin"]),
  expiresIn: z.number().optional(), // days
  allowedOperations: z.array(z.enum(["search", "write", "delete"])),
  ipRestrictions: z.array(z.string()).optional(),
});

export const apiKeyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
    //   await ctx.db.tier.createMany({
    //     data: [
    //       {
    //         name: "free",
    //         price: 0,
    //         documentLimit: 1000,
    //         storageLimit: 100000000, // 100MB in bytes
    //         searchesPerDay: 100,
    //         apiKeys: 2,
    //         collections: 1,
    //         features: ["search", "basic_indexing"]
    //       },
    //       {
    //         name: "pro",
    //         price: 29.99,
    //         documentLimit: 10000,
    //         storageLimit: 1000000000, // 1GB in bytes
    //         searchesPerDay: 1000,
    //         apiKeys: 5,
    //         collections: 5,
    //         features: ["search", "advanced_indexing", "analytics"]
    //       }
    //     ]
    //   });
      // Check user's tier limits
      const user = await ctx.db.user.findUnique({
        where: { id: session.user.id },
        include: {
          _count: {
            select: { apiKeys: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get tier limits
      const tierLimits = await ctx.db.tier.findUnique({
        where: { name: user.tier },
      });

      if (!tierLimits) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tier not found",
        });
      }

      // Check API key limit
      if (user._count.apiKeys >= tierLimits.apiKeys) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `API key limit reached for ${user.tier} tier`,
        });
      }

      // Generate API key
      const apiKey = await ctx.db.apiKey.create({
        data: {
          value: `sk_${nanoid(32)}`,
          name: input.name,
          type: input.type,
          userId: session.user.id,
          status: "active",
          allowedOperations: input.allowedOperations,
          ipRestrictions: input.ipRestrictions ?? [],
          expiresAt: input.expiresIn
            ? new Date(Date.now() + input.expiresIn * 24 * 60 * 60 * 1000)
            : null,
        },
      });

      return {
        id: apiKey.id,
        value: apiKey.value, // Only show value once
        name: apiKey.name,
        type: apiKey.type,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;

    return await ctx.db.apiKey.findMany({
      where: {
        userId: session.user.id,
        status: "active",
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        lastUsed: true,
        allowedOperations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  revoke: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const apiKey = await ctx.db.apiKey.findFirst({
        where: {
          id: input,
          userId: session.user.id,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await ctx.db.apiKey.update({
        where: { id: input },
        data: { status: "revoked" },
      });

      return { success: true };
    }),
});
