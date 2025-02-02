import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { userRouter } from "./routers";
import { apiKeyRouter } from "./routers/apikey";
import { tierRouter } from "./routers/tier";
import { collectionRouter } from "./routers/collections";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	user: userRouter,
	apiKey: apiKeyRouter,
	tier: tierRouter,
	collection: collectionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
