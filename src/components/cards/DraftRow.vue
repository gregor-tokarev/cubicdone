<script setup lang="ts">
import { Draft } from "../../models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";

defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
}>();

function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement;
  const value = target.textContent;

  value && emit("update:title", value);
}
</script>

<template>
  <div
    class="flex cursor-grab items-baseline border-b border-gray-400 p-2.5 active:cursor-grabbing"
  >
    <!--    Title-->
    <div
      contenteditable="true"
      @input="onEditDraft($event)"
      class="cursor-text text-base text-black outline-0"
    >
      {{ draft.title }}
    </div>
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
