import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";
import { hint } from "./directives/hint.ts";
import { inject } from "@vercel/analytics";
import { clerkPlugin } from "vue-clerk/plugin";

const pinia = createPinia();

inject();

createApp(App)
  .directive("hint", hint)
  .use(clerkPlugin, {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  })
  .use(router)
  .use(pinia)
  .mount("#app");
