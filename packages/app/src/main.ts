import { apiKeyStore } from "@models/api-key.model.ts";
import { draftStore } from "@models/draft.model.ts";
import { projectStore } from "@models/project.model.ts";
import { projectStatusStore } from "@models/projectStauts.model.ts";
import { taskStore } from "@models/task.model.ts";
import * as Sentry from "@sentry/vue";
import { createI18n } from "vue-i18n";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend";
import * as cookie from "cookie";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { vueSyncClientPlugin } from "vue-sync-client";
import App from "./App.vue";
import { hint } from "./directives/hint.ts";
import { router } from "./router";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import "./style.css";

const pinia = createPinia();

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.PROD
        ? import.meta.env.VITE_SYNC_URL
        : "http://localhost:4000",
      fetch(url, options) {
        const cookies = cookie.parse(document.cookie);
        const sessionToken = cookies["session"];

        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: sessionToken,
          },
        });
      },
    }),
  ],
});

dayjs.locale("ru");

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://b2a7371c480bdfb4603b8e8189a46d35@o1186023.ingest.us.sentry.io/4507594362585088",
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      isEmailRequired: true,
    }),
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/api.cubicdone\.com/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app
  .directive("hint", hint)
  .use(pinia)
  .use(vueSyncClientPlugin, {
    dbVersion: 11,
    schema: [
      taskStore,
      apiKeyStore,
      draftStore,
      projectStore,
      projectStatusStore,
    ],
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
  .use(router);

function customRule(choice: number, _choicesLength: number) {
  const calcValue = Math.abs(choice) % 100;
  const num = calcValue % 10;

  if (calcValue > 10 && calcValue < 20) return 3;
  if (num > 1 && num < 5) return 2;
  if (num === 1) return 1;
  return 3;
}

const i18n = createI18n({
  locale: "ru",
  fallbackLocale: "en",
  legacy: false,
  pluralizationRules: {
    ru: customRule,
  },
});
app.use(i18n);

app.mount("#app");
