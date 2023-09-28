<script setup lang="ts">
import Icon from "./Icon.vue";

defineProps<{
  placeholder: string,
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "enter", value: void): void
}>()
</script>

<template>
  <div class="flex items-center bg-gray-400 rounded-lg px-2.5 py-1">
    <Icon name="plus" class="text-gray-350 mr-1.5"></Icon>
    <input type="text" :value="modelValue" :placeholder="placeholder"
           @input="emit('update:modelValue', $event.currentTarget.value)"
           @keyup.enter="emit('enter')"
           class="bg-transparent placeholder-gray-350 text-base w-full border-0 outline-0">
  </div>
</template>

<style scoped>

</style>
