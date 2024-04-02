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
  <div
    class="mr-1.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-transparent hover:border-black"
    :class="{ 'bg-black': modelValue }"
    v-hint.bottom="'x'"
    @click="emit('update:modelValue', !modelValue)"
  >
    <Icon v-show="modelValue" class="text-white" name="check"></Icon>
  </div>
</template>
