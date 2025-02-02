import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { SearchAPI } from "@/lib/api";

export const collectionRouter = createTRPCRouter({
	getCollections: protectedProcedure
		// .input(z.object({ tierId: z.string() }))
		.query(async ({ ctx, input }) => {
			const getUserAPIKey = await ctx.db.apiKey.findMany({
				where: {
					userId: ctx.session?.user?.id,
				},
				select: {
					value: true,
				},
			});
			const search = new SearchAPI(getUserAPIKey[0]?.value || "");
			const collections = await search.getDocuments();
			return collections;
		}),
});
