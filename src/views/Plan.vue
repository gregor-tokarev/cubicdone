<script setup lang="ts">
import { ref } from "vue";
import { Draft } from "@models/draft.model.ts";
import PlanInbox from "@components/layout/plan/PlanInbox.vue";
import PlanPlanner from "@components/layout/plan/PlanPlanner.vue";

const integrationDrafts = ref<Draft[]>([]);
</script>

<template>
  <div class="flex h-[100vh] flex-col py-8">
    <!--  Inbox section-->
    <PlanInbox v-model:integration-drafts="integrationDrafts"></PlanInbox>
    <!--    Date columns-->
    <PlanPlanner
      class="grow"
      :integration-drafts="integrationDrafts"
    ></PlanPlanner>
  </div>
</template>
