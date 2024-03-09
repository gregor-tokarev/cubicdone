import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";
import { hint } from "./directives/hint.ts";
import { clerkPlugin } from "vue-clerk/plugin";
import { connect } from "sync-client/src/connect.ts";
import { taskTable } from "@models/task.model.ts";
import { projectTable } from "@models/project.model.ts";
import { draftTable } from "@models/draft.model.ts";
import { apiKeyTable } from "@models/api-key.model.ts";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend";

const pinia = createPinia();

export const idbContextManager = await connect(1, [
  taskTable,
  projectTable,
  draftTable,
  apiKeyTable,
]);

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:4000",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

idbContextManager.onSync(async (sync, resolveFn) => {
  if (sync.targetTable === taskTable.name) {
    const res = await trpc.draftList.query();
    console.log(res);
  }
});

createApp(App)
  .directive("hint", hint)
  .use(clerkPlugin, {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  })
  .use(router)
  .use(pinia)
  .mount("#app");
