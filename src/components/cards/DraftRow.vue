<script setup lang="ts">
import { Draft } from "@models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import TurndownService from "turndown";

const props = defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
}>();

function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement;
  let value = target.innerHTML;
  const turndown = new TurndownService();

  value = turndown.turndown(value);
  console.log(value);

  value && emit("update:title", value);
}

const text = computed(() => {
  // const regex = /`([^`]+)`/g;
  // const matches = [...props.draft.title.matchAll(regex)];
  //
  // let res = props.draft.title;
  // matches.forEach(([withBrackets, content]) => {
  //   res = res.replace(
  //     withBrackets,
  //     `<code class="[&>code]:text-xs [&>code]:inline-block [&>code]:rounded [&>code]:px-1 [&>code]:bg-gray-150 [&>code]:font-mono">${content}</code>`,
  //   );
  // });
  const markdown = new MarkdownIt();

  return markdown.render(props.draft.title);
});
</script>

<template>
  <div
    class="flex cursor-grab items-baseline border-b border-gray-400 p-2.5 active:cursor-grabbing"
  >
    <!--    Title-->
    <div
      contenteditable="true"
      @input="onEditDraft($event)"
      v-html="text"
      class="[&_code]:bg-gray-150 cursor-text text-base text-black outline-0 [&_code]:inline-block [&_code]:rounded [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs"
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
