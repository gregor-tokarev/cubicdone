<script setup lang="ts">
import { useAuth } from "vue-clerk";
import { watch } from "vue";
import { useRouter } from "vue-router";
import * as cookie from "cookie";

const { isSignedIn, isLoaded } = useAuth();
const router = useRouter();

watch(isLoaded, () => {
  if (!isLoaded.value) return;
  const c = cookie.parse(document.cookie);
  const session = c["__session"];

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
  <router-view v-if="isLoaded"></router-view>
  <div v-else class="loader">
    <div class="loader__content"></div>
  </div>
</template>

<style scoped></style>
