<script setup lang="ts">
import {Task} from "../../models/task.model.ts";
import Icon from "../Icon.vue";

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: "update:status", value: string): void
}>()
</script>

<template>
  <div class="flex items-center py-2.5 px-4 space-x-2 bg-gray-400 rounded-lg cursor-pointer"
       :class="{'opacity-50': task.status === 'done'}"
       @dblclick="emit('update:status', task.status === 'done' ? 'todo' : 'done')">
    <div class="flex items-center justify-center text-white w-5 h-5 rounded-full border-2 border-gray-350"
         :class="{'bg-black !border-black': task.status === 'done'}">
      <Icon v-if="task.status === 'done'" name="double-check"></Icon>
    </div>
    <span>{{ task.title }}</span>
  </div>
</template>

<style scoped>

</style>
