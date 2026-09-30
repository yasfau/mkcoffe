import { defineConfig } from "drizzle-kit";

process.loadEnvFile?.(".env.local");

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Migrasi lewat session pooler (5432); aplikasi lewat transaction pooler (6543)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
