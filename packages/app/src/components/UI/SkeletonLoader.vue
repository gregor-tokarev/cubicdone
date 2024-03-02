<template>
  <div :class="[bgClass, loaderClass, 'relative overflow-hidden']">
    <div
      class="shimmer absolute bottom-0 left-0 right-0 top-0"
      :style="shimmerStyle"
    ></div>
    <slot />
  </div>
</template>

<script lang="ts">
const LOADER_TYPES = { rectangle: "rectangle", circle: "circle" };

const LOADER_CSS_CLASSES = {
  [LOADER_TYPES.rectangle]: "rounded",
  [LOADER_TYPES.circle]: "rounded-full",
};

type LoaderTypesKeys = keyof typeof LOADER_TYPES;
type LoaderTypesValues = (typeof LOADER_TYPES)[LoaderTypesKeys];

const SHIMMER_COLOR = "#ffffff";

const isHexColor = (hexColor: string) => {
  const hex = hexColor.replace("#", "");

  return (
    hexColor.startsWith("#") && hex.length === 6 && !isNaN(Number("0x" + hex))
  );
};

const hexToRgb = (hex: string) =>
  `${hex.match(/\w\w/g)?.map((x) => +`0x${x}`)}`;
</script>

<script setup lang="ts">
import { computed, toRefs } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: LOADER_TYPES.rectangle,
    validator(value: LoaderTypesValues) {
      return Object.values(LOADER_TYPES).includes(value);
    },
  },
  bgClass: {
    type: String,
    default: "bg-gray-100",
  },
  cssClass: {
    type: String,
    default: "",
  },
  shimmerColor: {
    type: String,
    default: SHIMMER_COLOR,
  },
});

const { type, bgClass, cssClass, shimmerColor } = toRefs(props);

const shimmerStyle = computed(() => {
  const rgb = isHexColor(shimmerColor.value)
    ? hexToRgb(shimmerColor.value)
    : SHIMMER_COLOR;

  return {
    backgroundImage: `linear-gradient(90deg, rgba(${rgb}, 0) 0%, rgba(${rgb}, 0.2) 20%, rgba(${rgb}, 0.5) 60%, rgba(${rgb}, 0))`,
  };
});

const loaderClass = computed(() =>
  cssClass.value ? cssClass.value : LOADER_CSS_CLASSES[type.value],
);
</script>

<style lang="css" scoped>
.shimmer {
  transform: translateX(-100%);
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
