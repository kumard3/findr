import type { ApiKey, User } from "@prisma/client";

import { z } from "zod";

export interface Env {
  TYPESENSE_ADMIN_KEY: string;
  TYPESENSE_HOST: string;
  TYPESENSE_PORT: number;
  DATABASE_URL: string;
}

export interface ApiKeyWithUser extends ApiKey {
  user: User;
}

export interface TypesenseResponse {
  found: number;
  hits: unknown[];
  page: number;
  search_time_ms?: number;
}
const MAX_DOCUMENT_SIZE = 100000; // 100KB per document

// Single document validation
const documentValidation = z
  .record(z.string(), z.any())
  .refine(
    (doc) => JSON.stringify(doc).length <= MAX_DOCUMENT_SIZE,
    `Individual document size exceeds ${MAX_DOCUMENT_SIZE / 1000}KB limit`
  );

// Schema that accepts single document or array of documents
export const documentSchema = z.union([
  documentValidation,
  z.array(documentValidation),
]);
// export const documentSchema = z.object({
//   title: z.string().min(1).max(200),
//   content: z.string().max(100000),
//   metadata: z.object({
//     language: z.string().optional(),
//     tags: z.array(z.string()).optional(),
//     category: z.string().optional(),
//     author: z.string().optional(),
//     created_at: z.number().optional(),
//     updated_at: z.number().optional(),
//     collection_name: z.string().optional(),
//   }).optional(),
//   attributes: z.record(z.string(), z.union([
//     z.string(),
//     z.number(),
//     z.boolean(),
//     z.array(z.string()),
//     z.array(z.number())
//   ])).optional(),
// }).refine(
//   data => JSON.stringify(data).length <= 100000,
//   "Document size exceeds 100KB limit"
// );

export type ValidatedDocument = z.infer<typeof documentSchema>;

export interface SearchParams {
  q: string;
  query_by: string;
  per_page?: number;
  page?: number;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
  collection_name?: string;
}

export interface UserWithApiKey extends ApiKey {
  user: User;
}

export interface Env {
  TYPESENSE_ADMIN_KEY: string;
  TYPESENSE_HOST: string;
  TYPESENSE_PORT: number;
  DATABASE_URL: string;
}

export interface ApiKeyInfo {
  id: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
  requestCount: number;
}

export interface SearchParams {
  q: string;
  query_by: string;
  per_page?: number;
  page?: number;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
  max_hits?: number;
}

export interface IndexError extends Error {
  code: "RATE_LIMIT" | "INVALID_KEY" | "SCHEMA_ERROR" | "SERVER_ERROR";
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  details?: any;
}

export interface ApiKeyWithUser extends ApiKey {
  user: User;
}

export interface SearchParams {
  q: string;
  query_by: string;
  per_page?: number;
  page?: number;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
}

export interface UsageMetrics {
  documentsProcessed?: number;
  processingTime?: number;
  dataSize?: number;
}

export interface TypesenseResponse {
  found: number;
  hits: unknown[];
  page: number;
  search_time_ms?: number;
}

export interface IndexResponse {
  success: boolean;
  document: unknown;
  usage: UsageResponse;
}

export interface UsageResponse {
  used: number;
  limit: number;
  storage: number;
}
