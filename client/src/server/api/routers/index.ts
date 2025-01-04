import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { env } from "@/env";
import { TRPCClientError } from "@trpc/client";
import typesense from "@/lib/typesense";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const userData = await ctx.db.user.findMany({});
    return userData;
  }),
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string(),

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

          // Add any other initial user data
        },
      });
      return newUser;
    }),
  generateApiKey: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      if (!userId) {
        return new TRPCClientError("User ID is required");
      }

      const apiKey = Buffer.from(`${userId}:${Date.now()}`).toString("base64"); // Simple key generation

      await ctx.db.user.update({
        where: { id: userId },
        data: { apiKey },
      });
    }),
  // indexData: protectedProcedure
  //   .input(
  //     z.object({
  //       apiKey: z.string(),
  //       content: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { apiKey, content } = input;
  //     if (!apiKey || !content) {
  //       return new TRPCClientError("API key and content are required");
  //     }

  //     const user = await ctx.db.user.findUnique({ where: { apiKey } });
  //     if (!user) {
  //       return new TRPCClientError("Invalid API key");
  //     }

  //     const document = await ctx.db.document.create({
  //       data: { userId: user.id, content },
  //     });

  //     // Index in Typesense
  //     await typesense.collections("documents").documents().create({
  //       id: document.id,
  //       userId: user.id,
  //       content,
  //     });
  //   }),
  indexData: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        data: z.any().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { apiKey, data } = input;

      // Validate API key
      const user = await ctx.db.user.findUnique({ where: { apiKey } });
      if (!user) {
        throw new Error("Invalid API key");
      }

      const collectionName = `documen-${user.id}`;

      // Ensure the Typesense collection exists dynamically
      await ensureCollectionExists(collectionName);
      // const documents = [];
      // for (const doc of data) {
      //   documents.push({
      //     id: doc.id.toString() || `${user.id}-${Date.now()}`, // Generate unique ID if not provided
      //     ...doc,
      //   });
      // }
      // Prepare documents for indexing
      const documents = data.map((doc) => ({
        ...doc,
        id: String(doc.id) || `${user.id}-${Date.now()}`,
      }));
      console.log("first", documents);
      // Index documents in Typesense
      try {
        const result = await typesense
          .collections(collectionName)
          .documents()
          // .import(data, {
          //   action: "upsert", // Use upsert to update existing records or insert new ones
          // });
          .import(documents, {
            action: "upsert",
            batch_size: 1000,
          });

        console.log("Indexing result:", result);
        return { success: true, message: "Data indexed successfully." };
      } catch (error) {
        console.error("Error indexing documents:", error);
        // console.error("Error indexing documents:", error.importResults);
        throw new Error("Failed to index documents.");
      }
    }),
  // searchData: protectedProcedure
  //   .input(
  //     z.object({
  //       apiKey: z.string(),
  //       query: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { apiKey, query } = input;

  //     if (!apiKey || !query) {
  //       return new TRPCClientError("API key and query are required");
  //     }

  //     const user = await ctx.db.user.findUnique({ where: { apiKey } });
  //     if (!user) {
  //       return new TRPCClientError("Invalid API key");
  //     }

  //     // Search in Typesense with filter by userId
  //     const results = await typesense
  //       .collections("documents")
  //       .documents()
  //       .search({
  //         q: query as string,
  //         query_by: "content",
  //         filter_by: `userId:${user.id}`,
  //       });

  //     return results;
  //   }),
  searchData: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        query: z.string(),
        filters: z.record(z.string()).optional(), // Optional filters for metadata fields
      })
    )
    .query(async ({ ctx, input }) => {
      const { apiKey, query, filters } = input;

      // Validate API key
      const user = await ctx.db.user.findUnique({ where: { apiKey } });
      if (!user) {
        throw new Error("Invalid API key");
      }

      const collectionName = `documen-cm55l5np30000vacn9z9acvt3`;

      // Build filter query for Typesense
      // Build filter query for Typesense
      let filterBy = `userId:${user.id}`;
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          filterBy += ` && ${key}:${value}`;
        });
      }

      // Search in Typesense with query and filters
      try {
        const coll = await typesense.collections(collectionName).retrieve();
        const results = await typesense
          .collections(collectionName)
          .documents()
          .search({
            q: query,

            query_by: "*", // Search across all fields
            prefix: true,
            prioritize_num_matching_fields: true,
          });

        return results;
      } catch (error) {
        console.error("Error searching documents:", error);
        throw new Error("Failed to search documents.");
      }
    }),
});

async function ensureCollectionExists(collectionName: string) {
  try {
    // Check if the collection already exists
    const collections = await typesense.collections().retrieve();
    const collectionExists = collections.some(
      (collection) => collection.name === collectionName
    );
    // console.log(collections, "collections");
    // console.log(collectionExists, "collectionExists");
    if (!collectionExists) {
      // Create a new collection with a dynamic schema
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
