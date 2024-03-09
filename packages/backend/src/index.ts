import postgres from "postgres";
import * as schema from "./models/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import {
  publicProcedure,
  router,
  createContext,
  authedProcedure,
} from "./trpc";
import { draft } from "./models/schema";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

config({ path: ".env.local" });

const pg = postgres(process.env.DATABASE_URL ?? "");
export const db = drizzle(pg, { schema });

const appRouter = router({
  draftList: authedProcedure.query(async () => {
    const tasks = await db.select().from(draft);

    return tasks;
  }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
  middleware: cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
  createContext,
});

server.listen(4000);
