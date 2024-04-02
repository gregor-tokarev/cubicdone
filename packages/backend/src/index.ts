import postgres from "postgres";
import * as schema from "./models/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import { createContext, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { drafts } from "./router/draft.router";
import { tasks } from "./router/tasks.router";
import { projects } from "./router/project.router";
import { apiKeys } from "./router/apikey.router";
import { projectStatus } from "./router/project-status.router";

config({ path: ".env.local" });

const pg = postgres(process.env.DATABASE_URL ?? "");
export const db = drizzle(pg, { schema });

const appRouter = router({
  draft: drafts,
  task: tasks,
  project: projects,
  apiKey: apiKeys,
  projectStatus: projectStatus,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
  middleware: cors({
    origin: ["http://localhost:5173", "https://todo.tokarev.work"],
    credentials: true,
  }),
  createContext,
});

server.listen(4000);
