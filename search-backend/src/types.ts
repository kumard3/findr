import type { ApiKey, User } from "@prisma/client";
import { any, z } from "zod";

// Environment Variables
export interface Env {
  TYPESENSE_ADMIN_KEY: string;
  TYPESENSE_HOST: string;
  TYPESENSE_PORT: number;
  DATABASE_URL: string;
}

export const documentSchema = z.object({
  indexName: z.string(),
  body: z
    .object({
      id: z.string().optional(),
    })
    .passthrough(),
});

// Document Validation Schemas
const MAX_DOCUMENT_SIZE = 100000; // 100KB per document

export const bulkDocumentSchema = z.object({
  indexName: z.string(),
  body: z.array(
    z
      .object({
        id: z.string().optional(),
      })
      .passthrough()
  ),
}); // For bulk documents

export type ValidatedDocument = z.infer<typeof documentSchema>;

// API Key and User Interfaces
export interface ApiKeyInfo {
  id: string;
  userId: string;
  permissions: string[]; // Standardized
  rateLimit: number;
  requestCount: number;
}

export interface ApiKeyWithUser extends ApiKey {
  user: User;
}

// Search Parameters
export interface SearchParams {
  q: string;
  query_by?: string;
  per_page?: number;
  page?: number;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
  max_hits?: number;
  collection_name: string;
}

// Typesense Response
export interface TypesenseResponse {
  found: number;
  hits: unknown[];
  page: number;
  search_time_ms?: number;
}

// Error Handling
export interface IndexError extends Error {
  code: "RATE_LIMIT" | "INVALID_KEY" | "SCHEMA_ERROR" | "SERVER_ERROR";
  details?: any;
}

export interface CollectionIndexRequest {
  name: string;
  fields: {
    name: string;
    type: string;
    facet?: boolean;
    sort?: boolean;
  }[];
  default_sorting_field?: string;
  enable_nested_fields?: boolean;
}

export const InputSingleDocument = z.object({
  indexName: z.string(),
  body: z
    .record(z.union([z.string(), z.array(z.string()), z.number(), z.any()]))
    .refine(
      (doc) => JSON.stringify(doc).length <= MAX_DOCUMENT_SIZE,
      `Document size exceeds 100KB limit`
    ),
});

export const InputMutliDocument = z.object({
  indexName: z.string(),
  body: z.array(InputSingleDocument.shape.body),
});

export type InputDocument =
  | z.infer<typeof InputSingleDocument>
  | z.infer<typeof InputMutliDocument>;

export interface SingleCollectionDatatype {
  id: string;
  collection_name: string;
  indexed_at: number;
  user_id: string;
  document: {
    [key: string]: string | string[] | number | any;
  };
}
