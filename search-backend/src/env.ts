import { z } from "zod";

const envSchema = z.object({
  TYPESENSE_ADMIN_KEY: z.string().min(1, "TYPESENSE_ADMIN_KEY is required"),
  TYPESENSE_HOST: z.string().min(1, "TYPESENSE_HOST is required"),
  TYPESENSE_PORT: z.coerce.number().min(1, "TYPESENSE_PORT is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

// For TypeScript compatibility
const config = typeof Bun !== "undefined" ? Bun.env : process.env;

// Validate environment variables
const env = envSchema.parse(config);

export default env;
