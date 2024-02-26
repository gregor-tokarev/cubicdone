<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps<{ name: string }>();

const icon = defineAsyncComponent(
  () => import(`/src/assets/svg/${props.name}.vue`),
);
</script>

<template>
  <component :is="icon" />
</template>
