<script setup lang="ts">
import { useAuth } from "vue-clerk";
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const { isSignedIn, isLoaded } = useAuth();
const router = useRouter();

watch(isLoaded, () => {
  if (!isLoaded.value) return;

  if (!isSignedIn.value) {
    router.replace("/auth");
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
</template>

<style scoped></style>
