<script setup lang="ts">
import { Draft } from "../../models/draft.model.ts";
import dayjs from "dayjs";
import { useProjectStore } from "../../store/project.model.ts";
import { computed } from "vue";
import { Project } from "../../models/project.model.ts";

const props = defineProps<{
  draft: Draft;
}>();

const projectStore = useProjectStore();

const emit = defineEmits<{
  (e: "update:title", value: string): void;
}>();

const project = computed<Project | undefined>(() => {
  return props.draft.projectId
    ? projectStore.getOne(props.draft.projectId)
    : undefined;
});

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
    <div
      v-if="project"
      class="ml-auto rounded-lg px-1.5 py-1 text-xs"
      :class="{
        [`!bg-${project.color}-100`]: project,
        [`!text-${project.color}-400`]: project,
      }"
    >
      #{{ project.title }}
    </div>
  </div>
</template>

<style scoped></style>
