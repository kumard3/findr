// src/server/api/routers/apiKey.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["search", "write", "admin"]),
  expiresIn: z.number().optional(),
  allowedOperations: z.array(z.enum(["search", "write", "delete"])),
  ipRestrictions: z.array(z.string()).optional(),
});

export const apiKeyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Fetch user with tier info and API key count
      const user = await ctx.db.user.findUnique({
        where: { id: session.user.id },
        include: {
          _count: { select: { apiKeys: true } },
          tier: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Define tier limits (could be fetched from a `tier` table)
      const tierLimits = {
        free: { apiKeys: 100 },
        pro: { apiKeys: 500 },
        enterprise: { apiKeys: 1000 },
      };
      const userTier = user.tier?.name || "free"; // Default to "free" if not set
      const maxKeys = tierLimits[userTier as keyof typeof tierLimits]?.apiKeys;

      if (user._count.apiKeys >= maxKeys) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `API key limit (${maxKeys}) reached for ${userTier} tier`,
        });
      }

      const apiKey = await ctx.db.apiKey.create({
        data: {
          value: `sk_${nanoid(32)}`,
          name: input.name,
          permissions: input.allowedOperations,
          userId: session.user.id,
          status: "active",
          ipRestrictions: input.ipRestrictions ?? [],
          expiresAt: input.expiresIn
            ? new Date(Date.now() + input.expiresIn * 24 * 60 * 60 * 1000)
            : null,
          rateLimit: input.type === "admin" ? 1000 : 100,
          requestCount: 0,
          lastUsed: new Date(),
        },
      });

      return {
        id: apiKey.id,
        value: apiKey.value,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        permissions: apiKey.permissions,
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
        status: true,
        createdAt: true,
        expiresAt: true,
        lastUsed: true,
        permissions: true,
        requestCount: true,
        rateLimit: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  revoke: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const apiKey = await ctx.db.apiKey.findFirst({
        where: { id: input, userId: session.user.id },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found or does not belong to you",
        });
      }

      await ctx.db.apiKey.update({
        where: { id: input },
        data: { status: "revoked" },
      });

      return { success: true };
    }),
});
