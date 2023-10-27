import { createRouter, createWebHistory } from "vue-router";
import Plan from "../views/Plan.vue";
import Inbox from "../views/Inbox.vue";
import Projects from "../views/Projects.vue";
import Integrations from "../views/Integrations.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Plan,
    },
    {
      path: "/inbox",
      component: Inbox,
    },
    {
      path: "/projects",
      component: Projects,
    },
    {
      path: "/integrations",
      component: Integrations,
    },
  ],
});
