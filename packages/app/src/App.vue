<script setup lang="ts">
import { watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import * as cookie from "cookie";

const router = useRouter();

onMounted(() => {
  const c = cookie.parse(document.cookie);
  const session = c["session"];

  if (location.pathname.includes("/auth")) return;

  if (!session) {
    router.replace("/auth/signup");
  } else if (!isSignedIn.value) {
    router.replace("/auth/signin");
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
