<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import * as cookie from "cookie";
import { useUserStore } from "@store/user.ts";

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  const c = cookie.parse(document.cookie);
  const session = c["session"];

  if (location.pathname.includes("/auth")) return;
  if (!session) {
    return router.replace("/auth/signup");
  }

  await userStore.fetchUser();
  if (!userStore.user) {
    return router.replace("/auth/signin");
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
