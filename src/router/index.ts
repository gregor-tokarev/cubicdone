import {createRouter, createWebHistory} from "vue-router";
import Plan from "../views/Plan.vue";
import Inbox from "../views/Inbox.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [{
        path: "/plan",
        component: Plan
    }, {
        path: "/inbox",
        component: Inbox
    }]
})
