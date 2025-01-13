import { Client } from "typesense";
import type { SearchParams, IndexError, Env } from "../types";

export class TypesenseService {
  private client: Client;

  constructor(env: Env) {
    this.client = new Client({
      nodes: [
        {
          host: "localhost",
          port: 8108,
          protocol: "http",
        },
      ],
      apiKey: "xyz",
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

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async indexDocument(userId: string, document: any) {
    try {
      await this.createOrGetCollection(userId);
      const collection = this.client.collections(`collection_${userId}`);

      const documents = Array.isArray(document) ? document : [document];

      const enrichedDocuments = documents.map((doc) => ({
        ...doc,
        user_id: userId,
        indexed_at: Date.now(),
        // Preserve original id if exists, otherwise generate one
        id:
          doc.id?.toString() ||
          `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      }));

      // Use import for better performance
      return await collection.documents().import(enrichedDocuments, {
        action: "create",
        dirty_values: "coerce_or_reject",
      });
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
      // Ignore if collection doesn't exist
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
