<script setup lang="ts">
import { Task } from "../../models/task.model.ts";
import Icon from "../Icon.vue";

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: "update:status", value: Task["status"]): void;
}>();
</script>

<template>
  <div
    class="flex cursor-grab items-center space-x-2 rounded-lg bg-gray-400 px-4 py-2.5 active:cursor-grabbing"
    :class="{ 'opacity-50': task.status === 'done' }"
    @click="emit('update:status', task.status === 'done' ? 'todo' : 'done')"
  >
    <div
      class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center break-words rounded-full border-2 border-gray-350 text-white"
      :class="{ '!border-black bg-black': task.status === 'done' }"
    >
      <Icon v-if="task.status === 'done'" name="double-check"></Icon>
    </div>
    <span>{{ task.title }}</span>
  </div>
</template>

<style scoped></style>
