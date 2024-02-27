<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const allIcons = import.meta.url;
console.log(allIcons);

const props = defineProps<{ name: string }>();

const icon = defineAsyncComponent(
  () =>
    import(
      /* @vite-ignore */
      import.meta.env.DEV
        ? `/src/assets/svg/${props.name}.svg`
        : `/assets/svg${props.name}.svg`
    ),
);
</script>

<template>
  <component :is="icon" />
</template>
