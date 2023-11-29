<script setup lang="ts">
import { Draft } from "@models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";
import { computed, ref } from "vue";
import MarkdownIt from "markdown-it";
import TurndownService from "turndown";
import { getSelectionOffset, setSelectionOffset } from "@utils/focus.ts";

const props = defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
}>();

const titleEl = ref<HTMLElement | null>(null);

const turndown = new TurndownService({});
turndown.escape = (val) => val + " ";
function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement;

  const value = turndown.turndown(target);

  value && emit("update:title", value);

  if (!titleEl.value) return;
  const pos = getSelectionOffset(titleEl.value);
  if (!pos) return;

  setTimeout(() => {
    if (!titleEl.value) return;
    setSelectionOffset(titleEl.value, pos[0], pos[1]);
  });
}

const markdown = new MarkdownIt();
const text = computed(() => {
  const val = markdown.render(props.draft.title);
  console.log(props.draft.title, val);

  return val;
});
</script>

<template>
  <div
    class="flex cursor-grab items-baseline border-b border-gray-400 p-2.5 active:cursor-grabbing"
  >
    <!--    Title-->
    <div
      ref="titleEl"
      contenteditable="true"
      @input="onEditDraft($event)"
      v-html="text"
      class="cursor-text text-base text-black outline-0 [&_code]:inline-block [&_code]:rounded [&_code]:bg-gray-150 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs"
    ></div>
    <div class="ml-2.5 text-xs text-gray-300">
      {{ dayjs(draft.dateCreated).format("D MMM, HH:mm") }}
    </div>
    <ProjectTag
      class="ml-auto"
      v-if="draft.projectId"
      :project-id="draft.projectId"
    ></ProjectTag>
  </div>
</template>

<style scoped></style>
