import { createRouter, createWebHistory } from "vue-router";
import Plan from "../views/office/plan.vue";
import Inbox from "../views/office/inbox.vue";
import Projects from "../views/office/projects.vue";
import Integrations from "../views/office/integrations.vue";
import Office from "../views/layout/office.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Office,
      children: [
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
    },
    {
      path: "/auth/signup",
      component: () => import("../views/auth/signup.vue"),
    },
  ],
});
