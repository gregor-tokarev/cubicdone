<script setup lang="ts">
import { Draft } from "@models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";
import { ref } from "vue";
import Markdown from "@components/Markdown.vue";
import { setCursorPosition } from "@utils/focus.ts";

const props = defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
}>();

const mode = ref<"view" | "edit">("view");

function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement;
  const value = target.textContent;

  value && emit("update:title", value);
}

const editEl = ref<HTMLElement | null>(null);
function onKeydown(evt: KeyboardEvent) {
  if (evt.key === "`") {
    evt.preventDefault();

    const sel = window.getSelection();
    const range = sel?.getRangeAt(0);
    const offset = range?.startOffset;

    emit("update:title", props.draft.title + "``");

    setTimeout(() => {
      if (!editEl.value || !offset) return;

      setCursorPosition(editEl.value, offset + 1);
    });
  }
}
</script>

<template>
  <div
    class="flex cursor-grab items-center border-b border-gray-400 p-2.5 active:cursor-grabbing"
  >
    <!--    checkbox-->
    <div class="mr-1.5 h-4 w-4 cursor-pointer"></div>
    <div class="flex items-baseline">
      <!--    Title-->
      <div
        v-if="mode === 'edit'"
        contenteditable="true"
        @input="onEditDraft($event)"
        @keydown="onKeydown($event)"
        @blur="mode = 'view'"
        ref="editEl"
        class="cursor-text text-base text-black outline-0"
      >
        {{ draft.title }}
      </div>
      <Markdown
        v-else-if="mode === 'view'"
        @click="mode = 'edit'"
        :model-value="draft.title"
      ></Markdown>
      <div class="ml-2.5 text-xs text-gray-300">
        {{ dayjs(draft.dateCreated).format("D MMM, HH:mm") }}
      </div>
    </div>
    <ProjectTag
      class="ml-auto"
      v-if="draft.projectId"
      :project-id="draft.projectId"
    ></ProjectTag>
  </div>
</template>

<style scoped></style>
