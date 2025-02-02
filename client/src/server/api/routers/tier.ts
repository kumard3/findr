import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const tiers = {
  free: {
    name: "Free",
    documentLimit: 1000,
    storageLimit: 100 * 1024 * 1024, // 100MB
    searchesPerDay: 100,
    apiKeys: 1,
    collections: 1,
  },
};

export const tierRouter = createTRPCRouter({
  activate: protectedProcedure
    .input(z.object({ tierId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tier = tiers[input.tierId as keyof typeof tiers];

      if (!tier) {
        throw new Error("Invalid tier");
      }

      // Here you would typically:
      // 1. Update user's tier in the database
      // 2. Set up usage limits
      // 3. Initialize any necessary resources

      return {
        success: true,
        tier: tier.name,
      };
    }),

  getCurrentTier: protectedProcedure.query(async ({ ctx }) => {
    // Here you would typically fetch the user's current tier from the database
    return {
      tier: "free",
      limits: tiers.free,
    };
  }),
});
