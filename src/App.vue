<script setup lang="ts">
import { useAuth } from "vue-clerk";
import { watch } from "vue";
import { useRouter } from "vue-router";

const { isSignedIn, isLoaded } = useAuth();
const router = useRouter();

watch(isLoaded, () => {
  if (!isLoaded.value) return;

  if (!isSignedIn.value) {
    router.replace("/auth");
  }
});
</script>

<template>
  <router-view v-if="isLoaded"></router-view>
</template>

<style scoped></style>
