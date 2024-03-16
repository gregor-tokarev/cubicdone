import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";
import { hint } from "./directives/hint.ts";
import { clerkPlugin } from "vue-clerk/plugin";
import { taskStore } from "@models/task.model.ts";
import { projectStore } from "@models/project.model.ts";
import { draftStore } from "@models/draft.model.ts";
import { apiKeyStore } from "@models/api-key.model.ts";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend";
import { vueSyncClientPlugin } from "vue-sync-client";

const pinia = createPinia();

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.PROD
        ? import.meta.env.VITE_SYNC_URL
        : "http://localhost:4000",
      fetch(url, options) {
        const finOptions = {
          ...options,
          credentials: "include",
        } as RequestInit;
        console.log(finOptions);

        return fetch(url, finOptions);
      },
    }),
  ],
});

createApp(App)
  .directive("hint", hint)
  .use(clerkPlugin, {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  })
  .use(router)
  .use(pinia)
  .use(vueSyncClientPlugin, {
    dbVersion: 5,
    schema: [taskStore, apiKeyStore, draftStore, projectStore],
    onSync: async (sync, resolveFn) => {
      if (sync.targetTable === draftStore.name) {
        if (sync.action.actionName === "create")
          await trpc.draft.create.mutate(sync.action.data);
        else if (sync.action.actionName === "update")
          await trpc.draft.update.mutate(sync.action.data);
        else if (sync.action.actionName === "delete")
          await trpc.draft.delete.mutate(sync.action.id as string);
      } else if (sync.targetTable === taskStore.name) {
        if (sync.action.actionName === "create")
          await trpc.task.create.mutate(sync.action.data);
        else if (sync.action.actionName === "update")
          await trpc.task.update.mutate(sync.action.data);
        else if (sync.action.actionName === "delete")
          await trpc.task.delete.mutate(sync.action.id as string);
      } else if (sync.targetTable === apiKeyStore.name) {
        if (sync.action.actionName === "create")
          await trpc.apiKey.create.mutate(sync.action.data);
        else if (sync.action.actionName === "update")
          await trpc.apiKey.update.mutate(sync.action.data);
        else if (sync.action.actionName === "delete")
          await trpc.apiKey.delete.mutate(sync.action.id as string);
      } else if (sync.targetTable === projectStore.name) {
        if (sync.action.actionName === "create")
          await trpc.project.create.mutate(sync.action.data);
        else if (sync.action.actionName === "update")
          await trpc.project.update.mutate(sync.action.data);
        else if (sync.action.actionName === "delete")
          await trpc.project.delete.mutate(sync.action.id as string);
      }

      resolveFn();
    },
  })
  .mount("#app");
