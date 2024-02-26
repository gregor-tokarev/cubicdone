<script setup lang="ts">
import BaseButton from "@components/UI/BaseButton.vue";

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "save", value: void): void;
}>();
</script>

<template>
  <div
    class="flex translate-y-full items-center justify-between rounded-md bg-black px-4 py-2 text-white"
  >
    <span>{{ loading ? "Updating..." : "Profile Changed" }}</span>
    <BaseButton :loading="loading" @click="emit('save')">Save</BaseButton>
  </div>
</template>

<style scoped></style>
