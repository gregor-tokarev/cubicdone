<script setup lang="ts">
import Icon from "../components/Icon.vue";
import { useDraftsStore } from "../store/drafts.ts";
import DraftCard from "../components/cards/DraftCard.vue";
import { computed } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useTaskStore } from "../store/task.ts";
import TaskCard from "../components/cards/TaskCard.vue";
import { Task } from "../models/task.model.ts";
import { VueDraggableNext } from "vue-draggable-next";
import { Draft } from "../models/draft.model.ts";

const draftStore = useDraftsStore();
const taskStore = useTaskStore();

const dateColumns = computed(() => {
  const count = 3;
  const res = [];

  for (let i = 0; i < count; i++) {
    res.push(dayjs().add(i, "day"));
  }

  return res;
});

function onUpdateStatus(id: string, status: Task["status"]) {
  taskStore.update(id, { status });
}

function onMove(date: Dayjs, evt: any) {
  if ("added" in evt) {
    const item = evt["added"].element;

    if ("dateTodo" in item) {
      const task = item as Task;
      taskStore.changeTodoDate(
        task.id,
        date.toISOString(),
        evt["added"].newIndex,
      );
    } else {
      const draft = item as Draft;
      taskStore.commitDraft(
        draft.id,
        date.toISOString(),
        evt["added"].newIndex,
      );
    }
  } else if ("moved" in evt) {
    const item = evt["moved"].element;

    const oldIdx = evt["moved"].oldIndex;
    const newIdx = evt["moved"].newIndex;

    taskStore.changeOrder(item.id, oldIdx, newIdx);
  }
}
</script>

<template>
  <div class="flex flex-col py-8 h-[100vh]">
    <!--  Inbox section-->
    <div class="space-y-2.5">
      <div class="flex items-center space-x-2 text-black text-base">
        <Icon name="inbox"></Icon>
        <span>Inbox</span>
      </div>
      <VueDraggableNext
        class="flex items-center overflow-auto space-x-2.5 pb-2.5 min-h-[78px]"
        :list="draftStore.sortedDrafts"
        :group="{ name: 'tasks', put: false, pull: 'clone' }"
      >
        <DraftCard
          class="grow min-w-[25%] cursor-pointer"
          v-for="d in draftStore.sortedDrafts"
          :key="d.id"
          :data-id="d.id"
          :draft="d"
        ></DraftCard>
        <div
          v-if="!draftStore.sortedDrafts.length"
          class="flex items-center justify-center grow h-full text-sm text-gray-350"
        >
          <span>
            You plan all your Inbox Tasks. Start working or
            <router-link tag="span" class="text-black underline" to="/inbox"
              >create new drafts</router-link
            >
          </span>
        </div>
      </VueDraggableNext>
    </div>
    <!--    Date columns-->
    <div class="flex grow space-x-5 mt-5">
      <div
        class="py-1.5 px-2.5 rounded-lg bg-gray-500 grow w-1/3 flex flex-col"
        v-for="(c, idx) in dateColumns"
        :key="idx"
      >
        <div class="text-base text-black mb-5">
          <template v-if="idx === 0">Today,</template>
          <template v-else-if="idx === 1">Tomorrow,</template>
          {{ dayjs(c).format("DD MMM") }}
        </div>
        <VueDraggableNext
          class="grow space-y-2.5"
          @change="onMove(c, $event)"
          :list="taskStore.getByDate(c.toString())"
          :group="{ name: 'tasks' }"
        >
          <TaskCard
            v-for="t in taskStore.getByDate(c.toString())"
            :key="t.id"
            :task="t"
            data-drag
            :data-id="t.id"
            @update:status="onUpdateStatus(t.id, $event)"
          ></TaskCard>
        </VueDraggableNext>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
