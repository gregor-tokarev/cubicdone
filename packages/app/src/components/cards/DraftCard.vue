<script setup lang="ts">
import { Draft } from "contract-models";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";
import Markdown from "@components/Markdown.vue";

defineProps<{
  draft: Draft;
  hovered: boolean;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="cursor-grab space-y-1 rounded-lg border-2 border-transparent bg-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50 active:cursor-grabbing"
    :class="{ 'bg-gray-50': hovered, '!border-black': selected }"
  >
    <Markdown :model-value="draft.title"></Markdown>
    <div class="flex items-center space-x-1">
      <ProjectTag
        v-if="draft.projectId"
        :project-id="draft.projectId"
      ></ProjectTag>
      <a
        v-if="draft.external"
        class="flex cursor-pointer items-center space-x-1 rounded-lg bg-gray-400 px-1.5 py-1"
        :href="draft.external.link"
        target="_blank"
      >
        <img class="h-[14px] w-[14px]" :src="draft.external.iconURL" alt="" />
        <span class="text-xs">{{
          draft.external.projectTitle
            ? draft.external.projectTitle
            : draft.external.integrationName
        }}</span>
      </a>
      <span class="text-xs text-gray-700">
        {{ dayjs(draft.dateCreated).format("DD MMM, HH:MM") }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
