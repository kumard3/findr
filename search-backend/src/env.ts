// Instead of process.env

// For TypeScript compatibility
if (typeof Bun !== "undefined") {
  // Use Bun.env
  const config = Bun.env;
} else {
  // Fallback to process.env for other environments
  const config = process.env;
}
[7];
