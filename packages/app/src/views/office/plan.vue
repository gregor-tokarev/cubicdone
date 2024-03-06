<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Draft } from "@models/draft.model.ts";
import PlanInbox from "@components/layout/plan/PlanInbox.vue";
import PlanPlanner from "@components/layout/plan/PlanPlanner.vue";
import { useDraftsStore } from "@store/drafts.ts";
import { useTaskStore } from "@store/task.ts";
import { useProjectStore } from "@store/project.ts";

const integrationDrafts = ref<Draft[]>([]);
const draftStore = useDraftsStore();
const taskStore = useTaskStore();
const projectStore = useProjectStore();

onMounted(async () => {
  await Promise.all([
    draftStore.loadDrafts(),
    taskStore.loadTasks(),
    projectStore.loadProjects(),
  ]);
});
</script>

<template>
  <div class="flex h-[100vh] flex-col space-y-4 py-8">
    <!--  Inbox section-->
    <PlanInbox v-model:integration-drafts="integrationDrafts"></PlanInbox>
    <!--    Date columns-->
    <PlanPlanner
      class="grow"
      :integration-drafts="integrationDrafts"
    ></PlanPlanner>
  </div>
</template>
