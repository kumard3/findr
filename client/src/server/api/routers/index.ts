// src/server/api/routers/user.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      include: {
        apiKeys: true,
        usageLogs: { orderBy: { timestamp: "desc" }, take: 10 },
      },
    });
  }),

  createUser: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      return await ctx.db.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: hashedPassword,
          used: 0,
          storage: 0,
        },
      });
    }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;

    const userId = session?.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const [user, usageLogs, apiKeys] = await Promise.all([
      ctx.db.user.findUnique({
        where: { id: userId },
        select: { used: true, storage: true },
      }),
      ctx.db.usageLog.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
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

    return { user, usageLogs, apiKeys, stats };
  }),
});
