<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ name: string; size: number; height: number; width: number }>(),
  {
    name: "",
    size: 16,
    height: 16,
    width: 16,
  },
);

const finalHeight = computed(() => props.height ?? props.size);
const finalWidth = computed(() => props.width ?? props.size);
</script>

<template>
  <svg
    :width="finalWidth"
    :height="finalHeight"
    :viewBox="`0 0 ${finalWidth} ${finalHeight}`"
  >
    <!--    <use :xlinkHref="'#' + name"></use>-->
    <use :xlink:href="'#' + name"></use>
  </svg>
  <!--  <svg-icon :path="`/src/assets/svg/${name}.svg`"></svg-icon>-->
</template>
