<script setup lang="ts">
import Icon from "./Icon.vue";
import {onMounted, ref} from "vue";

defineProps<{
  placeholder: string,
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "enter", value: void): void
}>()

function onUpdate(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  if (!target) return

  emit("update:modelValue", target.value)
}

const inputField = ref(null)
onMounted(() => {
  const el = inputField.value as unknown as HTMLElement
  el.focus()

  // document.addEventListener("keyup", console.log)
})
</script>

<template>
  <div class="flex items-center bg-gray-400 rounded-lg px-2.5 py-1">
    <Icon name="plus" class="text-gray-350 mr-1.5"></Icon>
    <input type="text" :value="modelValue" :placeholder="placeholder"
           ref="inputField"
           @input="onUpdate"
           @keyup.enter="emit('enter')"
           class="bg-transparent placeholder-gray-350 text-base w-full border-0 outline-0">
  </div>
</template>

<style scoped>

</style>
