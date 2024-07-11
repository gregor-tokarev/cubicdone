import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./models/schema";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: ".env.local" });

const pg = postgres(process.env.DATABASE_URL ?? "");
export const db = drizzle(pg, { schema });
