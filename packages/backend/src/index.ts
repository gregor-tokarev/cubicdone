import { serve } from "@hono/node-server";
import { Hono } from "hono";
import postgres from "postgres";
import * as schema from "./models/schema";
import { apikey } from "./models/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

config({ path: ".env.local" });

const app = new Hono();

const pg = postgres(process.env.DATABASE_URL ?? "");
export const db = drizzle(pg, { schema });

app.use(logger());
app.use(
  cors({
    allowHeaders: ["*"],
    allowMethods: ["*"],
    origin: "*",
  }),
);
app.use("*", clerkMiddleware());
app.use("*", async (c, next) => {
  const auth = getAuth(c);

  if (auth?.userId) await next();

  c.status(401);
  return c.json({ message: "Unauthorized" });
});

app.get("/", async (c) => {
  const res = await db.select().from(apikey).execute();

  return c.json(res);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
