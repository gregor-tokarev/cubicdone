<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {focusOnEditableElement} from "../utils/focus.ts";

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

const editable = ref<HTMLElement | null>(null)

watch(() => props.modelValue, value => {
  // setTimeout(() => {
  if (!editable.value) return

  if (value !== editable.value.innerText) {
    editable.value.innerText = value

    focusOnEditableElement(editable.value)
  }
  // if (Math.abs(value.length - editable.value.innerText.length) > 1 || value.slice(0, editable.value.innerText.length) !== editable.value.innerText) {
  //   editable.value.innerText = value
  // }
  // })
})

onMounted(() => {
  if (!editable.value) return

  editable.value.innerText = props.modelValue
})

async function onInput(event: KeyboardEvent) {
  const target = event.currentTarget as HTMLElement;
  if (!target) return

  emits("update:modelValue", target.innerText)
}
</script>

<template>
  <component :is="tag" ref="editable" contenteditable="true" @keydown="onInput($event)"></component>
</template>

<style scoped>

</style>
