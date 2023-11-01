<script setup lang="ts">
import Icon from "../components/Icon.vue";
import { useDraftsStore } from "@store/drafts.ts";
import DraftCard from "@components/cards/DraftCard.vue";
import { computed, onMounted, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useTaskStore } from "@store/task.ts";
import TaskCard from "@components/cards/TaskCard.vue";
import { Task } from "@models/task.model.ts";
import { VueDraggableNext } from "vue-draggable-next";
import { VueSpinner } from "vue3-spinners";
import { Draft } from "@models/draft.model.ts";
import { useIntegrationStore } from "@store/integration.ts";
import { draftsFromIntegration } from "@utils/draftsFromIntegration.ts";

const draftStore = useDraftsStore();
const taskStore = useTaskStore();
const integrationStore = useIntegrationStore();

const dateColumns = computed(() => {
  const count = 3;
  const res = [];

  for (let i = 0; i < count; i++) {
    res.push(dayjs().add(i, "day"));
  }

  return res;
});

const loading = ref(false);
const integrationDrafts = ref<Draft[]>([]);
const allDrafts = computed(() => {
  return JSON.parse(
    JSON.stringify([...integrationDrafts.value, ...draftStore.drafts]),
  );
});

onMounted(async () => {
  if (integrationStore.mappedIntegrations.length) {
    loading.value = true;
    const taskPromises = integrationStore.mappedIntegrations.map((i) =>
      i.fetchTasks(),
    );
    try {
      const externalDrafts = (await Promise.all(taskPromises)).flat();

      integrationDrafts.value = draftsFromIntegration(
        externalDrafts.filter((d) => d.state !== "done"),
        draftStore.maxOrder,
        taskStore.tasks,
      );

      const taskIds = taskStore.tasks.map((t) => t.draftId);

      const draftsToUpdate = externalDrafts.filter(
        (d) => taskIds.indexOf(d.id) !== -1,
      );
      taskStore.updateFromIntegrations(draftsToUpdate);
    } finally {
      loading.value = false;
    }
  }
});

async function onUpdateStatus(id: string, status: Task["status"]) {
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

      if (!draft.external) {
        taskStore.commitDraft(
          draft.id,
          date.toISOString(),
          evt["added"].newIndex,
        );
      } else {
        taskStore.commitIntegration(
          draft,
          date.toISOString(),
          evt["added"].newIndex,
        );

        const integrationIdx = integrationDrafts.value.findIndex(
          (d) => d.id === draft.id,
        );
        integrationDrafts.value.splice(integrationIdx, 1);
      }
    }
  } else if ("moved" in evt) {
    const item = evt["moved"].element;

    const oldIdx = evt["moved"].oldIndex;
    const newIdx = evt["moved"].newIndex;

    taskStore.changeOrder(item.id, oldIdx, newIdx);
  }
}

function onChangeDraft(event: any) {
  const target = event.item as HTMLElement;
  target.style.maxWidth = "unset";
}
</script>

<template>
  <div class="flex h-[100vh] flex-col py-8">
    <!--  Inbox section-->
    <div class="space-y-2.5">
      <div class="flex items-center space-x-5">
        <div class="flex items-center space-x-2 text-base text-black">
          <Icon name="inbox"></Icon>
          <span>Inbox</span>
        </div>
        <div v-if="loading" class="flex items-center space-x-1.5 text-gray-350">
          <VueSpinner size="16px"></VueSpinner>
          <span>Loading...</span>
        </div>
      </div>
      <VueDraggableNext
        class="flex min-h-[78px] items-center space-x-2.5 overflow-auto pb-2.5"
        :list="allDrafts"
        @start="onChangeDraft($event)"
        :group="{ name: 'tasks', put: false, pull: 'clone' }"
      >
        <DraftCard
          class="min-w-[25%] grow"
          :class="{
            'max-w-[25%]': allDrafts.length >= 4,
            'max-w-[33%]': allDrafts.length === 3,
            'max-w-[50%]': allDrafts.length === 2,
          }"
          v-for="d in allDrafts"
          :key="d.id"
          :data-id="d.id"
          :draft="d"
        ></DraftCard>
        <div
          v-if="!allDrafts.length"
          class="flex h-full grow items-center justify-center text-sm text-gray-350"
        >
          <span>
            You plan all your Inbox Tasks. Start working or
            <router-link tag="span" class="text-black underline" to="/inbox">
              create new drafts
            </router-link>
          </span>
        </div>
      </VueDraggableNext>
    </div>
    <!--    Date columns-->
    <div class="mt-5 flex grow space-x-5">
      <div
        class="flex w-1/3 grow flex-col rounded-lg bg-gray-500 px-2.5 py-1.5"
        v-for="(c, idx) in dateColumns"
        :key="idx"
      >
        <div class="mb-5 text-base text-black">
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
