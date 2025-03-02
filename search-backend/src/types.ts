import type { ApiKey, User } from "@prisma/client";
import { z } from "zod";

// Environment Variables
export interface Env {
  TYPESENSE_ADMIN_KEY: string;
  TYPESENSE_HOST: string;
  TYPESENSE_PORT: number;
  DATABASE_URL: string;
}

// Document Validation Schemas
const MAX_DOCUMENT_SIZE = 100000; // 100KB per document
export const documentValidation = z.object({
  id: z.string().optional(),
  content: z.string().min(1), // Required content field
}).refine(
  (doc) => JSON.stringify(doc).length <= MAX_DOCUMENT_SIZE,
  `Document size exceeds 100KB limit`
);
export const documentSchema = documentValidation; // For single document
export const bulkDocumentSchema = z.array(documentValidation); // For bulk documents

export type ValidatedDocument = z.infer<typeof documentValidation>;

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
  query_by: string;
  per_page?: number;
  page?: number;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
  max_hits?: number;
  collection_name?: string;
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