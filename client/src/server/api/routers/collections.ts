// src/server/api/routers/collection.ts
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const collectionRouter = createTRPCRouter({
  getCollections: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;

    // Fetch user's collections from Prisma
    const collections = await ctx.db.collection.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        documentCount: true,
        storageSize: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return collections;
  }),
});
