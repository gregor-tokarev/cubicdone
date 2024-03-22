<script setup lang="ts">
import { Draft } from "@models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";
import { ref } from "vue";
import Markdown from "@components/Markdown.vue";
import { setCursorPosition } from "@utils/focus.ts";
import Icon from "../Icon.vue";
import { replaceAt } from "@utils/replaceAt.ts";
import { onClickOutside, useDebounceFn } from "@vueuse/core";

const props = defineProps<{
  draft: Draft;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
  (e: "update:selected", value: boolean): void;
}>();

const editEl = ref<HTMLElement | null>(null);

const mode = ref<"view" | "edit">("view");
onClickOutside(editEl, () => {
  mode.value = "view";
});

function editDraft(event: Event) {
  const target = event.target as HTMLElement;
  const value = target.textContent;

  value && emit("update:title", value);
}

const onEditDraft = useDebounceFn(editDraft, 1000);

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === "`") {
    evt.preventDefault();

    const sel = window.getSelection();
    const range = sel?.getRangeAt(0);
    const offset = range?.startOffset;

    if (offset === undefined) return;

    emit("update:title", replaceAt(props.draft.title, offset, "``"));

    setTimeout(() => {
      if (!editEl.value || offset === undefined) return;

      setCursorPosition(editEl.value, offset + 1);
    });
  }
}
</script>

<template>
  <div
    ref="rootEl"
    class="flex cursor-grab items-center border-b border-gray-400 p-2.5 transition-colors duration-75 hover:bg-gray-50 active:cursor-grabbing"
    :class="{ '!border-black bg-gray-50': selected }"
  >
    <!--    checkbox-->
    <div
      class="mr-1.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-transparent hover:border-black"
      :class="{ 'bg-black': selected }"
      v-hint.bottom="'x'"
      @click="emit('update:selected', !selected)"
    >
      <Icon v-show="selected" class="text-white" name="check"></Icon>
    </div>
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
      <div class="ml-2.5 text-xs text-gray-600">
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
