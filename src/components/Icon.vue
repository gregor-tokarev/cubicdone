<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps<{ name: string }>();

const icons = import.meta.glob("../assets/svg/**");
console.log(icons);
const iconPath = Object.keys(icons).find((key) => key.includes(props.name));
console.log(iconPath);

const icon = defineAsyncComponent(() => import(iconPath ?? ""));
</script>

<template>
  <component :is="icon"></component>
  <!--  <svg-icon :path="`/src/assets/svg/${name}.svg`"></svg-icon>-->
</template>
