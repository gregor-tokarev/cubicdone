<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps<{ name: string }>();

const icon = defineAsyncComponent(
  () =>
    import(
      import.meta.env.DEV
        ? `/src/assets/svg/${props.name}.vue`
        : `/assets/svg/${props.name}.vue`
    ),
);
</script>

<template>
  <component :is="icon" />
</template>
