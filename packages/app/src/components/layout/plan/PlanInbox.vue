<script setup lang="ts">
import DraftCard from "@components/cards/DraftCard.vue";
import { VueSpinner } from "vue3-spinners";
import { VueDraggableNext } from "vue-draggable-next";
import { computed, ref, watchEffect } from "vue";
import { useDraftsStore } from "@store/drafts.ts";
import { useOnline } from "@vueuse/core";
import { draftsFromIntegration } from "@utils/draftsFromIntegration.ts";
import { useTaskStore } from "@store/task.ts";
import { Draft } from "contract-models";
import Icon from "@components/Icon.vue";
import { Integration } from "@models/integration.model.ts";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  integrationDrafts: Draft[];
  activatedIntegrations: Integration[];
}>();
const emit = defineEmits<{
  (e: "update:integrationDrafts", value: Draft[]): void;
}>();

const draftStore = useDraftsStore();
const taskStore = useTaskStore();

const loadingDrafts = ref(false);

const allDrafts = computed(() => {
  return JSON.parse(
    JSON.stringify([...props.integrationDrafts, ...draftStore.sortedDrafts]),
  );
});

const isOnline = useOnline();
watchEffect(() => {
  if (props.activatedIntegrations.length && isOnline.value) {
    try {
      loadingDrafts.value = true;
      let genCount = 0;

      props.activatedIntegrations
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
            }

            genCount++;
            if (genCount >= props.activatedIntegrations.length)
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

function onStartDraggingDraft(event: any) {
  const target = event.item as HTMLElement;
  target.style.maxWidth = "unset";
}

async function onChangeDraft(evt: any) {
  if ("added" in evt) {
    const data = evt["added"]["element"];
    const idx = evt["added"]["newIndex"];

    if ("external" in data && data.external) {
      const draft: Draft = {
        id: data.draftId,
        dateCreated: data.dateCreated,
        dateUpdated: data.dateUpdated,
        title: data.title,
        projectId: data.projectId,
        order: Math.max(...props.integrationDrafts.map((d) => d.order)) + 1,
        external: data.external,
      };

      const newIntegrations = JSON.parse(
        JSON.stringify([...props.integrationDrafts, draft]),
      ) as Draft[];

      emit("update:integrationDrafts", newIntegrations);

      await taskStore.remove(data["id"]);
    } else {
      await draftStore.revertFromTask(data["id"], idx);
    }
  }
}

const { t } = useI18n({
  messages: {
    en: {
      title: "Inbox",
      loading: "Loading...",
      emptyDrafts: "You plan all your Inbox Tasks. Start working or",
      createNewDrafts: "create new drafts",
    },
    ru: {
      title: "Входящие",
      loading: "Загрузка...",
      emptyDrafts: "Вы распланировали все свои задачи, начинайте работать или",
      createNewDrafts: "создайте новые драфты",
    },
  },
});
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex items-center space-x-5">
      <div class="flex items-center space-x-2 text-base text-black">
        <Icon name="inbox" :size="24"></Icon>
        <span>{{ t("title") }}</span>
      </div>
      <div
        v-if="loadingDrafts"
        class="flex items-center space-x-1.5 text-gray-600"
      >
        <VueSpinner size="16px"></VueSpinner>
        <span>{{ t("loading") }}</span>
      </div>
    </div>
    <VueDraggableNext
      class="flex min-h-[78px] items-center space-x-2.5 overflow-auto pb-2.5"
      :list="allDrafts"
      @change="onChangeDraft($event)"
      @start="onStartDraggingDraft($event)"
      :group="{ name: 'tasks', pull: 'clone' }"
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
          {{ t("emptyDrafts") }}
          <router-link tag="span" class="text-black underline" to="/inbox">
            {{ t("createNewDrafts") }}
          </router-link>
        </span>
      </div>
    </VueDraggableNext>
  </div>
</template>

<style scoped></style>
