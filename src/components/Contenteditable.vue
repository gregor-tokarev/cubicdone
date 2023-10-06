<script setup lang="ts">
import {onMounted, ref} from "vue";

const props = withDefaults(defineProps<{
  tag: string
  modelValue: string
}>(), {
  tag: "p",
  modelValue: "",
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editable = ref(null)

onMounted(() => {
  editable.value.innerText = props.modelValue
})

async function onInput(event: InputEvent) {
  const target = event.currentTarget as HTMLElement;
  if (!target) return

  emits("update:modelValue", target.innerText)
}
</script>

<template>
  <component :is="tag" ref="editable" contenteditable="true" @input="onInput($event)">{{ modelValue }}</component>
</template>

<style scoped>

</style>
