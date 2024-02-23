<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import TaskCard from "@components/cards/TaskCard.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useTaskStore } from "@store/task.ts";
import { Task } from "@models/task.model.ts";

defineProps<{
  date: Dayjs;
}>();

const emit = defineEmits<{
  (e: "move", value: [Dayjs, any]): void;
}>();

const taskStore = useTaskStore();

async function onUpdateStatus(id: string, status: Task["status"]) {
  taskStore.update(id, { status });
}
</script>

<template>
  <div
    ref="root"
    class="flex flex-col rounded-lg bg-gray-50 px-2.5 py-1.5"
    :data-date="date"
  >
    <div class="mb-5 text-base text-black">
      <!--          TODO: make it align with dates later-->
      <!--          <template v-if="idx === 0">Today,</template>-->
      <!--          <template v-else-if="idx === 1">Tomorrow,</template>-->
      {{ dayjs(date).format("DD MMM") }}
    </div>
    <VueDraggableNext
      class="grow space-y-2.5 overflow-y-auto"
      @change="emit('move', [date, $event])"
      :list="taskStore.getByDate(date.toString())"
      :group="{ name: 'tasks' }"
    >
      <TaskCard
        v-for="t in taskStore.getByDate(date.toString())"
        :key="t.id"
        :task="t"
        data-drag
        :data-id="t.id"
        @update:status="onUpdateStatus(t.id, $event)"
      ></TaskCard>
    </VueDraggableNext>
  </div>
</template>

<style scoped></style>
