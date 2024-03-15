<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const markdown = new MarkdownIt();
const markdownContent = computed(() => {
  return markdown.render(props.modelValue);
});
</script>

<template>
  <div class="root" v-html="markdownContent"></div>
</template>

<style scoped lang="postcss">
.root :deep(code) {
  @apply bg-gray-150 inline-block rounded px-1 font-mono text-xs;
}
</style>
