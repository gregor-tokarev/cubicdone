<script setup lang="ts">
import { ContextMenuItem } from "@models/contextmenu.model.ts";

defineProps<{
  show: boolean;
  options: ContextMenuItem[];
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "option", value: ContextMenuItem["value"]): void;
}>();
</script>

<template>
  <div
    v-if="show"
    class="border-gray-150 z-10 min-w-[220px] space-y-1 rounded border bg-gray-50 px-1.5 py-2.5"
    v-bind="$attrs"
  >
    <div
      v-for="itm in options"
      :key="itm.id"
      class="flex cursor-pointer items-center justify-between rounded px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-100"
      @click="emit('option', itm.value)"
    >
      <span>{{ itm.label }}</span>
      <kbd>{{ itm.kbd }}</kbd>
    </div>
  </div>
  <div
    v-if="show"
    @click="emit('update:show', false)"
    class="fixed inset-0"
  ></div>
</template>

<style scoped></style>
