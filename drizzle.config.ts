import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Add it to .env.local.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["website"],
  dbCredentials: { url: process.env.DATABASE_URL },
  // The migrations log lives in the website schema too, never in public.
  migrations: { schema: "website", table: "__drizzle_migrations" },
});
