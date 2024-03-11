import { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default {
  schema: "./src/models/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
} satisfies Config;
