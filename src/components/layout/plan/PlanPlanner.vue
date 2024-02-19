<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { useTaskStore } from "@store/task.ts";
import { Task } from "@models/task.model.ts";
import { Draft } from "@models/draft.model.ts";
import { useIntersectionObserver } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import PlanColumn from "@components/layout/plan/PlanColumn.vue";

const props = defineProps<{
  integrationDrafts: Draft[];
}>();

// const integrationStore = useIntegrationStore();
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
const columnEls = computed(() => {
  return columnComponents.value.map((col) => col.root);
});
const columnsRoot = ref<HTMLElement | null>(null);

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

    if (intersectedDays.some((day) => dayColumns.value[1].isSame(day, "day"))) {
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
        dayColumns.value[dayColumns.value.length - 2].isSame(day, "day"),
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
  columnEls.value[todayIndex.value + 2]?.scrollIntoView();
});

function onMove([date, evt]: [Dayjs, any]) {
  console.log();
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
  <div ref="columnsRoot" class="mt-5 flex grow space-x-5 overflow-x-auto">
    <PlanColumn
      ref="columnComponents"
      v-for="(c, idx) in dayColumns"
      :date="c"
      :key="idx"
      @move="onMove"
      class="column-w"
    ></PlanColumn>
  </div>
</template>

<style scoped>
.column-w {
  width: calc(33% - 13px);
}
</style>
