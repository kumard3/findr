import { Client } from "typesense";
import type { SearchParams, IndexError, Env } from "../types";

export class TypesenseService {
  private client: Client;

  constructor(env: Env) {
    this.client = new Client({
      nodes: [
        {
          host: env.TYPESENSE_HOST,
          port: env.TYPESENSE_PORT,
          protocol: "http",
        },
      ],
      apiKey: env.TYPESENSE_ADMIN_KEY,
      connectionTimeoutSeconds: 2,
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async indexDocument(userId: string, document: any) {
    try {
      const collection = this.client.collections(`collection_${userId}`);
      const enrichedDocument = {
        ...document,
        user_id: userId,
        indexed_at: Date.now(),
        id: `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      };

      // Validate document size
      if (JSON.stringify(enrichedDocument).length > 100000) {
        throw new Error("Document too large");
      }

      return await collection.documents().create(enrichedDocument);
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
}
