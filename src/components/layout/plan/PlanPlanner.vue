<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { useTaskStore } from "@store/task.ts";
import { Task } from "@models/task.model.ts";
import { Draft } from "@models/draft.model.ts";
import { computed, onMounted, ref } from "vue";
import PlanColumn from "@components/layout/plan/PlanColumn.vue";

import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const props = defineProps<{
  integrationDrafts: Draft[];
}>();

const taskStore = useTaskStore();

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

const columnComponents = ref<InstanceType<typeof PlanColumn>[]>([]);
const columnsRoot = ref<InstanceType<typeof RecycleScroller> | null>(null);

function onScroll(_evt: Event) {
  const scroll: { start: number; end: number } = columnsRoot.value.getScroll();
  const totalSize: number = columnsRoot.value.totalSize;

  if (scroll.end === totalSize) {
    loadAfterColumns();
  } else if (scroll.start === 0) {
    loadBeforeColumns();

    setTimeout(() => {
      const newSize: number = columnsRoot.value.totalSize;

      columnsRoot.value.scrollToPosition(newSize - totalSize);
    });
  }
}

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

onMounted(async () => {
  setTimeout(() => {
    columnsRoot.value?.scrollToItem(INITIAL_COLUMNS_COUNT / 2);
  });
});

function onMove([date, evt]: [Dayjs, any]) {
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

        const integrationIdx = props.integrationDrafts.findIndex(
          (d) => d.id === draft.id,
        );
        props.integrationDrafts.splice(integrationIdx, 1);
      }
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
  <RecycleScroller
    ref="columnsRoot"
    :items="dayColumns"
    :item-size="330"
    key-field="$d"
    direction="horizontal"
    emit-update
    @scroll="onScroll"
    v-slot="{ item }"
  >
    <PlanColumn
      ref="columnComponents"
      :date="item"
      @move="onMove"
      class="w-[310px] pr-2.5"
    ></PlanColumn>
  </RecycleScroller>
</template>

<style scoped></style>
