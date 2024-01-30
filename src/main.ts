import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";
import { hint } from "./directives/hint.ts";
import { inject } from "@vercel/analytics";

const pinia = createPinia();

inject();

createApp(App).directive("hint", hint).use(router).use(pinia).mount("#app");
