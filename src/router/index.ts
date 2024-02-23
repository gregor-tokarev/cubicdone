import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/layout/office.vue"),
      children: [
        {
          path: "/",
          component: () => import("../views/office/plan.vue"),
        },
        {
          path: "/inbox",
          component: () => import("../views/office/inbox.vue"),
        },
        {
          path: "/projects",
          component: () => import("../views/office/projects.vue"),
        },
        {
          path: "/integrations",
          component: () => import("../views/office/integrations.vue"),
        },
        {
          path: "/profile",
          component: () => import("../views/office/profile.vue"),
        },
      ],
    },
    {
      path: "/auth/signup",
      component: () => import("../views/auth/signup.vue"),
    },
  ],
});
