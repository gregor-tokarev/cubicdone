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
    class="relative rounded-xl px-7 py-1.5"
    :class="{
      'bg-black text-white': color === 'black',
      'bg-gray-400 text-black': color === 'gray',
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
