import { useSession } from "next-auth/react";
import { z } from "zod";

const SEARCH_API_URL = "http://localhost:9000";
// const SEARCH_API_URL = process.env.SEARCH_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

interface SearchResult {
  document: Record<string, unknown>;
  text_match?: number;
  highlights?: Array<{
    field: string;
    snippet: string;
  }>;
}

interface SearchResponse {
  hits: SearchResult[];
  found: number;
  page: number;
  search_time_ms?: number;
}

const ApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["search", "write", "admin"]),
  expiresIn: z.number().optional(), // days
  allowedOperations: z.array(z.enum(["search", "write", "delete"])),
  ipRestrictions: z.array(z.string()).optional(),
});

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

type ApiHeaders = {
  "x-api-key": string;
  "Content-Type"?: "application/json";
};

export class SearchAPI {
  private userId: string | null = null;
  private collectionName: string | null = null;

  constructor() {
    this.apiKey = "sk_gn1J2Cax8ggGkRMipFVpmYKvHlIvUrdh"
  }

  private getHeaders(includeContentType = false): ApiHeaders {
    const headers: ApiHeaders = {
      "x-api-key": this.apiKey,
    };
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  async searchDocuments(
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<
    Array<{
      document: Record<string, unknown>;
      score: number;
      highlights: Array<{ field: string; snippet: string }>;
    }>
  > {
    // await this.validateApiKey();
    try {
      const searchParams = {
        q: query,
        query_by: "content",
        filter_by: `user_id:${this.userId}`,
        per_page: Math.min(options.limit || 10, 100),
        page: (options.offset || 0) + 1,
      };

      const response = await fetch(
        `${SEARCH_API_URL}/api/search?${new URLSearchParams({
          ...searchParams,
          per_page: searchParams.per_page.toString(),
          page: searchParams.page.toString(),
        })}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.error("Search failed:", response.statusText);
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const searchResults = (await response.json()) as SearchResponse;
      return searchResults.hits?.map((hit) => ({
        document: hit.document,
        ...hit.document,
        score: hit.text_match || 0,
        highlights: hit.highlights || [],
      }));
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error("Failed to search documents");
    }
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean }> {
    // await this.validateApiKey();
    try {
      const response = await fetch(
        `${SEARCH_API_URL}/api/documents/${documentId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.error("Delete failed:", response.statusText);
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  }

  async indexDocument(
    document: z.infer<typeof DocumentSchema>
  ): Promise<ApiResponse<unknown>> {
    // await this.validateApiKey();
    try {
      const documents = Array.isArray(document) ? document : [document];

      const enrichedDocuments = documents.map((doc) => ({
        ...doc,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        user_id: this.userId!,
        indexed_at: Date.now(),
        id:
          doc.id?.toString() ||
          `${this.userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      }));

      const response = await fetch(`${SEARCH_API_URL}/api/bulk-index`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(enrichedDocuments),
      });

      if (!response.ok) {
        console.error("Index failed:", response.statusText);
        throw new Error(`Index failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error indexing document:", error);
      throw new Error("Failed to index document");
    }
  }

  async getCollections(): Promise<ApiResponse<unknown>> {
    // await this.validateApiKey();
    try {
      const response = await fetch(`${SEARCH_API_URL}/api/collections`, {
        headers: this.getHeaders(),
      });

      // if (!response.ok) {
      //   console.error("Failed to fetch collections:", response.statusText);
      //   throw new Error("Failed to fetch collections");
      // }
      const data = await response.json();
      console.log("data", data);
      return data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      return { error: { message: "Failed to fetch collections" } };
    }
  }
  async getDocuments(): Promise<ApiResponse<unknown>> {
    // await this.validateApiKey();
    try {
      const response = await fetch(`${SEARCH_API_URL}/api/documents`, {
        headers: this.getHeaders(),
      });

      // if (!response.ok) {
      //   console.error("Failed to fetch collections:", response.statusText);
      //   throw new Error("Failed to fetch collections");
      // }
      const data = await response.json();
      console.log("data", data);
      return data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      return { error: { message: "Failed to fetch collections" } };
    }
  }

  async deleteCollection(collectionId: string): Promise<{ success: boolean }> {
    // await this.validateApiKey();
    try {
      const response = await fetch(
        `${SEARCH_API_URL}/api/collections/${collectionId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.error("Failed to delete collection:", response.statusText);
        throw new Error("Failed to delete collection");
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting collection:", error);
      throw new Error("Failed to delete collection");
    }
  }
}
