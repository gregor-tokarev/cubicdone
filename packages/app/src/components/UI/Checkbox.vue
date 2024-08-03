<script setup lang="ts">
import Icon from "@components/Icon.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<template>
  <div class="relative">
    <div
      class="peer absolute -inset-2 cursor-pointer"
      v-hint.bottom="'x'"
      @click="emit('update:modelValue', !modelValue)"
    ></div>
    <div
      class="flex h-4 w-4 items-center justify-center rounded border border-transparent peer-hover:border-black"
      :class="{ 'bg-black': modelValue }"
    >
      <Icon v-show="modelValue" class="text-white" name="check"></Icon>
    </div>
  </div>
</template>
