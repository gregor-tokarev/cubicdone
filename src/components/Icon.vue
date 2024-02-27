<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps<{ name: string }>();

const icon = defineAsyncComponent(
  () =>
    import(
      /* @vite-ignore */
      `/src/assets/svg/${props.name}.svg`
    ),
);
</script>

<template>
  <component :is="icon" />
</template>
