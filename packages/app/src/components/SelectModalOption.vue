<script setup lang="ts">
import Icon from "./Icon.vue";

defineProps<{
  option: {
    id: string;
    text: string;
    icon?: string;
    color?: string;
  };

  active: boolean;
  check: boolean;
}>();
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-between px-2.5 py-1.5 transition-colors hover:bg-gray-300"
    :class="{ 'bg-gray-300': active }"
  >
    <!--        Color circle-->
    <div class="flex items-center space-x-1.5">
      <Icon v-if="option.icon" size="14px" :name="option.icon"></Icon>
      <div
        v-else-if="option.color"
        class="h-[11px] w-[11px] rounded-full"
        :class="{ [`bg-${option.color}-400`]: true }"
      ></div>
      <span>{{ option.text }}</span>
    </div>
    <Icon v-if="check" name="check" class="text-gray-800"></Icon>
  </div>
</template>
