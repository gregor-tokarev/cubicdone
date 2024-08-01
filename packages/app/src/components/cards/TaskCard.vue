<script setup lang="ts">
import { Task } from "contract-models";
import Icon from "../Icon.vue";
import ProjectTag from "../UI/ProjectTag.vue";
import Markdown from "@components/Markdown.vue";

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: "update:status", value: Task["status"]): void;
}>();
</script>

<template>
  <div
    class="flex cursor-grab items-start space-x-2 rounded-lg bg-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50 active:cursor-grabbing"
    :class="{ 'opacity-50 hover:!bg-gray-100': task.status === 'done' }"
  >
    <div
      class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center break-words rounded-full border-2 border-gray-600 text-white"
      @click="emit('update:status', task.status === 'done' ? 'todo' : 'done')"
      :class="{ '!border-black bg-black': task.status === 'done' }"
    >
      <Icon v-if="task.status === 'done'" name="double-check"></Icon>
    </div>
    <div class="flex flex-col items-start space-y-1.5">
      <Markdown :model-value="task.title"></Markdown>
      <div class="flex space-x-2">
        <ProjectTag
          v-if="task.projectId"
          :project-id="task.projectId"
        ></ProjectTag>
        <a
          v-if="task.external"
          class="flex items-center space-x-1 rounded-lg bg-gray-400 px-1.5 py-1"
          :href="task.external.link"
          target="_blank"
        >
          <img class="h-[14px] w-[14px]" :src="task.external.iconURL" alt="" />
          <span class="text-xs">{{
            task.external.projectTitle
              ? task.external.projectTitle
              : task.external.integrationName
          }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
