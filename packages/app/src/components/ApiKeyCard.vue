<script setup lang="ts">
import { ApiKey } from "@models/api-key.model.ts";

defineProps<{
  apiKey: ApiKey;
}>();

const emit = defineEmits<{
  (e: "revoke", value: void): void;
}>();
</script>

<template>
  <div
    class="flex items-center justify-between rounded bg-gray-100 px-2 py-1 text-black"
  >
    <span>{{ apiKey.label }}</span>
    <button
      class="rounded border border-gray-150 px-2 py-[3px] text-xs"
      @click="emit('revoke')"
    >
      Revoke
    </button>
  </div>
</template>

<style scoped></style>
