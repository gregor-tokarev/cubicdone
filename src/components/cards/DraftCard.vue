<script setup lang="ts">
import { Draft } from "@models/draft.model.ts";
import dayjs from "dayjs";
import ProjectTag from "../UI/ProjectTag.vue";

defineProps<{
  draft: Draft;
}>();
</script>

<template>
  <div
    class="cursor-grab space-y-1 rounded-lg bg-gray-400 px-4 py-2.5 active:cursor-grabbing"
  >
    <p class="">{{ draft.title }}</p>
    <div class="space-x flex items-center space-x-1">
      <ProjectTag
        v-if="draft.projectId"
        :project-id="draft.projectId"
      ></ProjectTag>
      <span class="text-xs text-gray-350">
        {{ dayjs(draft.dateCreated).format("DD MMM, HH:MM") }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
