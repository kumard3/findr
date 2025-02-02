import { Client } from "typesense";
import type { SearchParams, IndexError, Env } from "../types";
import { z } from "zod";
import { db } from "../db";
import env from "../env";

const MAX_DOCUMENT_SIZE = 100000; // 100KB per document

const documentValidation = z
  .record(z.string(), z.any())
  .refine(
    (doc) => JSON.stringify(doc).length <= MAX_DOCUMENT_SIZE,
    `Individual document size exceeds ${MAX_DOCUMENT_SIZE / 1000}KB limit`
  );

const DocumentSchema = z.union([
  documentValidation,
  z.array(documentValidation),
]);



const TypesenseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  adminKey: z.string().min(1),
});

export class TypesenseService {
  private _client: Client;

  public get client(): Client {
    return this._client;
  }

  constructor() {
    const config = TypesenseConfigSchema.parse({
      host: env.TYPESENSE_HOST,
      port: env.TYPESENSE_PORT,
      adminKey: env.TYPESENSE_ADMIN_KEY,
    });

    this._client = new Client({
      nodes: [
        {
          host: config.host,
          port: config.port,
          protocol: "http",
        },
      ],
      apiKey: config.adminKey,
      connectionTimeoutSeconds: 2,
    });
  }

  async createOrGetCollection(userId: string) {
    const collectionName = `collection_${userId}`;
    try {
      return await this.client.collections(collectionName).retrieve();
    } catch (error) {
      // Create collection with dynamic schema
      return await this.client.collections().create({
        name: collectionName,
        fields: [
          { name: "user_id", type: "string", facet: true },
          { name: "indexed_at", type: "int64", sort: true },
          // Allow any field with auto schema detection
          { name: ".*", type: "auto" },
        ],
        default_sorting_field: "indexed_at",
      });
    }
  }

  async indexDocument(
    userId: string,
    document: z.infer<typeof DocumentSchema>
  ) {
    try {
      await this.createOrGetCollection(userId);
      const collection = this.client.collections(`collection_${userId}`);

      const documents = Array.isArray(document) ? document : [document];

      const enrichedDocuments = documents.map((doc) => ({
        ...doc,
        user_id: userId,
        indexed_at: Date.now(),
        id:
          doc.id?.toString() ||
          `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      }));

      const indexedDoc = await collection
        .documents()
        .import(enrichedDocuments, {
          action: "create",
          dirty_values: "coerce_or_reject",
        });

      const documentSize = Buffer.byteLength(JSON.stringify(document), "utf8");

      await db.user.update({
        where: { id: userId },
        data: {
          used: { increment: 1 },
          storage: { increment: documentSize },
        },
      });

      await db.usageLog.create({
        data: {
          userId,
          operation: "index",
          status: "success",
          documentsProcessed: 1,
          dataSize: documentSize,
          processingTime: 0,
        },
      });

      return indexedDoc;
    } catch (error) {
      const indexError: IndexError = new Error(
        error instanceof Error ? error.message : "Index error"
      ) as IndexError;
      indexError.code = "SCHEMA_ERROR";
      indexError.details = error;
      throw indexError;
    }
  }

  async search(userId: string, params: SearchParams) {
    const searchParams = {
      ...params,
      filter_by: `user_id:=${userId}`,
      per_page: Math.min(params.per_page || 10, 100),
      max_hits: Math.min(params.max_hits || 1000, 10000),
    };

    return await this.client
      .collections(`collection_${userId}`)
      .documents()
      .search(searchParams);
  }

  async deleteCollection(userId: string) {
    try {
      return await this.client.collections(`collection_${userId}`).delete();
    } catch (error) {
      return null;
    }
  }

  async getCollectionStats(userId: string) {
    try {
      return await this.client.collections(`collection_${userId}`).retrieve();
    } catch (error) {
      return null;
    }
  }
}
