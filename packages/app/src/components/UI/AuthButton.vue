<script setup lang="ts">
interface Props {
  disabled: boolean;
}

defineProps<Props>();
</script>

<template>
  <button
    :disabled="disabled"
    class="hover:bg-gray-150 flex min-w-[520px] items-center justify-center space-x-2 rounded-md border border-gray-400 py-4 text-[20px] text-gray-800 transition-colors"
    :class="{ 'pointer-events-none opacity-75': disabled }"
  >
    <slot></slot>
  </button>
</template>

<style scoped></style>
