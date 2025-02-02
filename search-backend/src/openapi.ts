import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

const app = new OpenAPIHono();

// Common schemas
const ErrorResponse = z.object({
  error: z.string(),
  code: z.number(),
  details: z.any().optional(),
});

const ApiKeyHeader = z.object({
  "x-api-key": z.string().describe("API key for authentication"),
});

const DocumentSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  collection_name: z.string().optional(),
});

const SearchParamsSchema = z.object({
  q: z.string().describe("Search query"),
  query_by: z.string().default("content").describe("Fields to search in"),
  per_page: z.number().default(10).describe("Results per page"),
  page: z.number().default(1).describe("Page number"),
  collection_name: z
    .string()
    .default("default")
    .describe("Collection to search in"),
});

// OpenAPI route definitions
export const routes = {
  "/api/index": {
    post: {
      tags: ["Documents"],
      summary: "Index a new document",
      security: [{ apiKey: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: DocumentSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Document indexed successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                document: z.any(),
              }),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: ErrorResponse,
            },
          },
        },
      },
    },
  },
  "/api/search": {
    get: {
      tags: ["Documents"],
      summary: "Search documents",
      security: [{ apiKey: [] }],
      parameters: [
        { name: "q", in: "query", required: true, schema: z.string() },
        { name: "query_by", in: "query", schema: z.string() },
        { name: "per_page", in: "query", schema: z.string() },
        { name: "page", in: "query", schema: z.string() },
        { name: "collection_name", in: "query", schema: z.string() },
      ],
      responses: {
        200: {
          description: "Search results",
          content: {
            "application/json": {
              schema: z.any(),
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: ErrorResponse,
            },
          },
        },
      },
    },
  },
  "/api/documents/{id}": {
    delete: {
      tags: ["Documents"],
      summary: "Delete a document",
      security: [{ apiKey: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: z.string() },
      ],
      responses: {
        200: {
          description: "Document deleted successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
              }),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: ErrorResponse,
            },
          },
        },
        403: {
          description: "Forbidden - Write permission required",
          content: {
            "application/json": {
              schema: ErrorResponse,
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: ErrorResponse,
            },
          },
        },
      },
    },
  },
};

export const openApiConfig = {
  openapi: "3.0.0",
  info: {
    title: "Search API Documentation",
    version: "1.0.0",
    description: "API documentation for the search service",
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
      },
    },
  },
};
