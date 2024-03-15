<script setup lang="ts">
import { VueSpinnerDots } from "vue3-spinners";

withDefaults(
  defineProps<{
    color: "black" | "gray";
    loading: boolean;
  }>(),
  {
    color: "black",
    loading: false,
  },
);
</script>

<template>
  <button
    class="relative rounded-xl border px-7 py-1.5 transition-colors"
    :class="{
      'bg-black text-white ring-gray-900 hover:bg-gray-900  focus:ring-2':
        color === 'black',
      'border-gray-150 hover:bg-gray-150 bg-gray-100 text-black':
        color === 'gray',
    }"
  >
    <div :class="{ 'opacity-0': loading }">
      <slot></slot>
    </div>
    <VueSpinnerDots
      class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
      size="50px"
      v-if="loading"
    ></VueSpinnerDots>
  </button>
</template>

<style scoped></style>
