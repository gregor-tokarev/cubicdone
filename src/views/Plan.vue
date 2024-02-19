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
import { useIntersectionObserver, useOnline } from "@vueuse/core";

const draftStore = useDraftsStore();
const taskStore = useTaskStore();
const integrationStore = useIntegrationStore();

// Initial Day columns generation
const INITIAL_COLUMNS_COUNT = 10;
const COLUMNS_PER_PAGE = 5;

const initialDayColumns = [];
for (let i = -(INITIAL_COLUMNS_COUNT / 2); i < INITIAL_COLUMNS_COUNT / 2; i++) {
  initialDayColumns.push(dayjs().add(i, "day"));
}
const dayColumns = ref<Dayjs[]>(initialDayColumns);

const todayIndex = computed(() => {
  return dayColumns.value.findIndex((date) => {
    return dayjs().isSame(date, "day");
  });
});
// End of initial Day colum generation

// let observer: IntersectionObserver | null = null;
const columnEls = ref<HTMLElement[]>([]);
const columnsRoot = ref<HTMLElement | null>(null);

async function loadBeforeColumns() {
  const newColumns = [];

  for (let i = 1; i < COLUMNS_PER_PAGE + 1; i++) {
    newColumns.push(dayColumns.value[0].add(-i, "day"));
  }

  dayColumns.value = newColumns.reverse().concat(dayColumns.value);
}
async function loadAfterColumns() {
  const newColumns = [];

  for (let i = 1; i < COLUMNS_PER_PAGE + 1; i++) {
    newColumns.push(
      dayColumns.value[dayColumns.value.length - 1].add(i, "day"),
    );
  }

  dayColumns.value = dayColumns.value.concat(newColumns);
}

useIntersectionObserver(
  columnEls,
  async (entries, _observer) => {
    if (entries.some((ent) => !ent.isIntersecting)) return;

    const intersectedDays = entries.map((ent) => {
      const target = ent.target as HTMLElement;
      return dayjs(target.dataset.date);
    });

    if (!columnsRoot.value) return;
    const widthBeforeUpdate = columnsRoot.value.scrollWidth;
    const scrollLeft = columnsRoot.value.scrollLeft;

    if (intersectedDays.some((day) => dayColumns.value[0].isSame(day, "day"))) {
      await loadBeforeColumns();

      setTimeout(() => {
        if (!columnsRoot.value) return;

        const widthAfterUpdate = columnsRoot.value.scrollWidth;
        const scrollPosition =
          widthAfterUpdate - widthBeforeUpdate + scrollLeft;

        columnsRoot.value.scrollTo({ left: scrollPosition });
      });
    } else if (
      intersectedDays.some((day) =>
        dayColumns.value[dayColumns.value.length - 1].isSame(day, "day"),
      )
    ) {
      await loadAfterColumns();
    }
  },
  {
    root: columnsRoot,
    threshold: 0.7,
  },
);

const loadingDrafts = ref(false);
const integrationDrafts = ref<Draft[]>([]);
const allDrafts = computed(() => {
  return JSON.parse(
    JSON.stringify([...integrationDrafts.value, ...draftStore.drafts]),
  );
});

const isOnline = useOnline();
onMounted(async () => {
  columnEls.value[todayIndex.value + 2].scrollIntoView();

  const activatedIntegrations = integrationStore.mappedIntegrations.filter(
    (i) => i.apiKeys.length,
  );

  if (activatedIntegrations.length && isOnline.value) {
    try {
      loadingDrafts.value = true;
      let genCount = 0;

      activatedIntegrations
        .map((i) => i.fetchTasks())
        .forEach(async (taskGenerator) => {
          try {
            for await (const tasksFromKey of taskGenerator) {
              const draftedTasks = draftsFromIntegration(
                tasksFromKey,
                draftStore.maxOrder,
                taskStore.tasks,
              );

              integrationDrafts.value =
                integrationDrafts.value.concat(draftedTasks);

              const taskIds = taskStore.tasks.map((t) => t.draftId);

              const draftsToUpdate = tasksFromKey.filter(
                (d) => taskIds.indexOf(d.id) !== -1,
              );
              taskStore.updateFromIntegrations(draftsToUpdate);
            }

            genCount++;
            if (genCount >= activatedIntegrations.length)
              loadingDrafts.value = false;
          } catch (err) {
            console.error(err);
            loadingDrafts.value = false;
          }
        });
    } catch (e) {
      console.error(e);
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
        <div
          v-if="loadingDrafts"
          class="flex items-center space-x-1.5 text-gray-600"
        >
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
          class="scrollbar-none flex h-full grow items-center justify-center text-sm text-gray-600"
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
    <div ref="columnsRoot" class="mt-5 flex grow space-x-5 overflow-x-auto">
      <div
        ref="columnEls"
        class="column-w flex shrink-0 grow flex-col rounded-lg bg-gray-50 px-2.5 py-1.5"
        v-for="(c, idx) in dayColumns"
        :key="idx"
        :data-date="c"
      >
        <div class="mb-5 text-base text-black">
          <!--          TODO: make it align with dates later-->
          <!--          <template v-if="idx === 0">Today,</template>-->
          <!--          <template v-else-if="idx === 1">Tomorrow,</template>-->
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

<style scoped>
.column-w {
  width: calc(33% - 13px);
}
</style>
