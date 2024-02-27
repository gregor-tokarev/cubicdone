<script setup lang="ts">
withDefaults(defineProps<{ name: string; size: number }>(), {
  name: "",
  size: 16,
});
</script>

<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
    <!--    <use :xlinkHref="'#' + name"></use>-->
    <use :xlink:href="'#' + name"></use>
  </svg>
  <!--  <svg-icon :path="`/src/assets/svg/${name}.svg`"></svg-icon>-->
</template>
