<script setup lang="ts">
import DraftCard from "@components/cards/DraftCard.vue";
import { VueSpinner } from "vue3-spinners";
import { VueDraggableNext } from "vue-draggable-next";
import { computed, onMounted, ref } from "vue";
import { useDraftsStore } from "@store/drafts.ts";
import { useOnline } from "@vueuse/core";
import { draftsFromIntegration } from "@utils/draftsFromIntegration.ts";
import { useIntegrationStore } from "@store/integration.ts";
import { useTaskStore } from "@store/task.ts";
import { Draft } from "@models/draft.model.ts";
import Icon from "@components/Icon.vue";

const props = defineProps<{
  integrationDrafts: Draft[];
}>();
const emit = defineEmits<{
  (e: "update:integrationDrafts", value: Draft[]): void;
}>();

const draftStore = useDraftsStore();
const integrationStore = useIntegrationStore();
const taskStore = useTaskStore();

const loadingDrafts = ref(false);

const allDrafts = computed(() => {
  return JSON.parse(
    JSON.stringify([...props.integrationDrafts, ...draftStore.drafts]),
  );
});

const isOnline = useOnline();
onMounted(() => {
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

              emit(
                "update:integrationDrafts",
                props.integrationDrafts.concat(draftedTasks),
              );

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

function onChangeDraft(event: any) {
  const target = event.item as HTMLElement;
  target.style.maxWidth = "unset";
}
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex items-center space-x-5">
      <div class="flex items-center space-x-2 text-base text-black">
        <Icon name="inbox" :size="24"></Icon>
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
</template>

<style scoped></style>
