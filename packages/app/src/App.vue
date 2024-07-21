<script setup lang="ts">
import { useUserStore } from "@store/user.ts";
import * as cookie from "cookie";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
    const c = cookie.parse(document.cookie);
    const session = c["session"];

    if (!session) {
        return router.replace("/auth");
    }

    if (location.pathname.includes("/auth")) return;

    try {
        await userStore.fetchUser();
    } catch {
        console.log("Error");
        return router.replace("/auth");
    }
});

router.onError((error, to) => {
    if (
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Importing a module script failed")
    ) {
        location.href = to.fullPath;
    }
});
</script>

<template>
    <router-view></router-view>
</template>

<style scoped></style>
