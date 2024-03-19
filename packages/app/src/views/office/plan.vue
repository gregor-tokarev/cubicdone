<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Draft } from "@models/draft.model.ts";
import PlanInbox from "@components/layout/plan/PlanInbox.vue";
import PlanPlanner from "@components/layout/plan/PlanPlanner.vue";
import { useDraftsStore } from "@store/drafts.ts";
import { useTaskStore } from "@store/task.ts";
import { useProjectStore } from "@store/project.ts";
import { useIntegrationStore } from "@store/integration.ts";
import { Integration } from "@models/integration.model.ts";

const integrationStore = useIntegrationStore();
const draftStore = useDraftsStore();
const taskStore = useTaskStore();
const projectStore = useProjectStore();

const integrationDrafts = ref<Draft[]>([]);
const activatedIntegrations = ref<Integration[]>([]);

onMounted(async () => {
  await Promise.all([
    draftStore.loadDrafts(),
    taskStore.loadTasks(),
    projectStore.loadProjects(),
    integrationStore.loadKeys(),
  ]);

  activatedIntegrations.value = integrationStore.mappedIntegrations.filter(
    (int) => int.apiKeys.length,
  );
});
</script>

<template>
  <div class="flex h-[100vh] flex-col space-y-4 py-8">
    <!--  Inbox section-->
    <PlanInbox
      v-model:integration-drafts="integrationDrafts"
      :activated-integrations="activatedIntegrations"
    ></PlanInbox>
    <!--    Date columns-->
    <PlanPlanner
      class="grow"
      v-model:integration-drafts="integrationDrafts"
    ></PlanPlanner>
  </div>
</template>
