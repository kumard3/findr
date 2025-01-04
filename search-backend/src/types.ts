// import type { ApiKey, User } from "@prisma/client";

import type { ApiKey, User } from "@prisma/client";

// export interface Env {
//   TYPESENSE_ADMIN_KEY: string;
//   DATABASE_URL: string;
//   TYPESENSE_HOST: string;
//   TYPESENSE_PORT: number;
// }

export interface UserWithApiKey extends ApiKey {
  user: User;
}

// export interface TypesenseDocument {
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   [key: string]: any;
//   user_id: string;
//   created_at: number;
// }

// export interface SearchParams {
//   q: string;
//   query_by?: string;
//   per_page?: number;
//   filter_by?: string;
//   sort_by?: string;
// }

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