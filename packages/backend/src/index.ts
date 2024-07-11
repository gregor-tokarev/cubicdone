import { createContext, router } from "./trpc";
import cors from "cors";
import { drafts } from "./router/draft.router";
import { tasks } from "./router/tasks.router";
import { projects } from "./router/project.router";
import { apiKeys } from "./router/apikey.router";
import { projectStatus } from "./router/project-status.router";
import cookieParser from "cookie-parser";

import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { webcrypto } from "node:crypto";
import { authRouter } from "./router/auth.router";
import {
  oauthRedirectRouter,
  sameOauthState,
} from "./webhooks/oauth-redirects";
import { oauthUrlRouter } from "./webhooks/oauth-url";

globalThis.crypto = webcrypto as Crypto;

const appRouter = router({
  draft: drafts,
  task: tasks,
  project: projects,
  apiKey: apiKeys,
  projectStatus: projectStatus,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://app.cubicdone.com"],
    credentials: true,
  }),
);

app.use(cookieParser());

app.use("/oauth/redirect", oauthRedirectRouter);
app.use("/oauth", oauthUrlRouter);

app.use(
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

app.listen(4000);
