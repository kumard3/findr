import { Client } from "typesense";
import type { SearchParams, IndexError, ValidatedDocument } from "../types";
import env from "../env";
import { z } from "zod";

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
      nodes: [{ host: config.host, port: config.port, protocol: "http" }],
      apiKey: config.adminKey,
      connectionTimeoutSeconds: 2,
    });
  }

  async createOrGetCollection(userId: string, name: string) {
    const collectionName = `collection_${userId}_${name}`;
    try {
      return await this.client.collections(collectionName).retrieve();
    } catch (error) {
      return await this.client.collections().create({
        name: collectionName,
        fields: [
          { name: "user_id", type: "string", facet: true },
          { name: "indexed_at", type: "int64", sort: true },
          { name: ".*", type: "auto" },
        ],
        default_sorting_field: "indexed_at",
        enable_nested_fields: true, // Enable dynamic indexing of nested fields
      });
    }
  }

  async indexDocument(
    userId: string,
    collectionName: string,
    document: ValidatedDocument["body"]
  ) {
    try {
      await this.createOrGetCollection(userId, collectionName);
      const collection = this.client.collections(
        `collection_${userId}_${collectionName}`
      );

      // const documents = Array.isArray(document) ? document : [document];
      const enrichedDocuments = {
        id: document.id,
        indexed_at: Date.now(),
        user_id: userId,
        body: document,
      };

      console.log("enrichedDocuments", enrichedDocuments);
      const indexedDoc = await collection.documents().create(enrichedDocuments);

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
  async indexBulkDocument(
    userId: string,
    collectionName: string,
    document: ValidatedDocument | ValidatedDocument[]
  ) {
    try {
      await this.createOrGetCollection(userId, collectionName);
      const collection = this.client.collections(
        `collection_${userId}_${collectionName}`
      );

      const documents = Array.isArray(document) ? document : [document];
      const enrichedDocuments = documents.map((doc) => ({
        ...doc,
        indexed_at: Date.now(),
      }));

      const indexedDoc = await collection.documents().upsert(enrichedDocuments);

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

  async search(userId: string, collectionName: string, params: SearchParams) {
    const searchParams = {
      ...params,
      filter_by: `user_id:=${userId}`,
      per_page: Math.min(params.per_page || 10, 100),
      max_hits: Math.min(params.max_hits || 1000, 10000),
      collection_name: `collection_${userId}_${collectionName}`,
    };

    return await this.client
      .collections(`collection_${userId}_${collectionName}`)
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
