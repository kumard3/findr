import { Client } from "typesense";
import type { SearchParams, IndexError, ValidatedDocument } from "../types";
import env from "../env";
import { z } from "zod";
import { DocumentSchema } from "typesense/lib/Typesense/Documents";
import { HTTPError } from "typesense/lib/Typesense/Errors";
import fs from "fs";
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

  async createOrGetCollection(collectionName: string) {
    try {
      return await this.client.collections(collectionName).retrieve();
    } catch (error) {
      return await this.client.collections().create({
        name: collectionName,
        fields: [
          { name: "indexed_at", type: "int64", sort: true },
          { name: ".*", type: "auto" },
        ],
        default_sorting_field: "indexed_at",
        enable_nested_fields: true,
      });
    }
  }

  async indexDocument(collectionName: string, document: DocumentSchema[]) {
    try {
      // Ensure the collection exists
      await this.createOrGetCollection(collectionName);
      const collection = this.client.collections(collectionName);
      console.log("document", document);
      fs.appendFileSync("document.log", `${JSON.stringify(document)}\n`);
      const indexedDocs = await collection.documents().import(document, {
        action: "create",
        dirty_values: "coerce_or_reject",
        batch_size: 100,
      });

      return indexedDocs;
    } catch (error) {
      // console.error("Error indexing document:", error);
      const indexError: IndexError = new Error(
        error instanceof Error ? error.message : "Index error"
      ) as IndexError;
      indexError.code = "SCHEMA_ERROR";
      indexError.details = error;
      fs.appendFileSync("indexError.log", `${JSON.stringify(error)}\n`);

      throw indexError;
    }
  }

  async search(userId: string, collectionName: string, params: SearchParams) {
    try {
      const searchParams = {
        ...params,
        query_by: "document",
        per_page: Math.min(params.per_page || 10, 100),
        max_hits: Math.min(params.max_hits || 1000, 10000),
        collection_name: `collection_${userId}_${collectionName}`,
      };

      return await this.client
        .collections(`collection_${userId}_${collectionName}`)
        .documents()
        .search({
          ...searchParams,
        });
    } catch (error) {
      fs.appendFileSync("searchError.log", `${JSON.stringify(error)}\n`);
      throw error;
    }
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
