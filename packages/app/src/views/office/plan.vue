<script setup lang="ts">
import CommandPalette from "@components/CommandPalette.vue";
import PlanInbox from "@components/layout/plan/PlanInbox.vue";
import PlanPlanner from "@components/layout/plan/PlanPlanner.vue";
import { Integration } from "@models/integration.model.ts";
import { useDeleteModalStore } from "@store/delete-modal";
import { useDraftsStore } from "@store/drafts.ts";
import { useIntegrationStore } from "@store/integration.ts";
import { useProjectStore } from "@store/project.ts";
import { useProjectModalStore } from "@store/select-modal";
import { useTaskStore } from "@store/task.ts";
import { Draft } from "contract-models";
import hotkeys from "hotkeys-js";
import { animate } from "motion";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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

  hotkeys("esc", () => {
    selectedDraftIds.value = [];
    selectedTaskIds.value = [];
  });

  hotkeys("shift+p", () => {
    onSetProject();
  });

  hotkeys("cmd+backspace", () => {
    onDelete();
  });
});

const { t } = useI18n({
  messages: {
    en: {
      setProject: "Set project",
      delete: "Delete",

      deleteModal: {
        multipleDelete: `Are you sure you want to delete {length} items?`,
        warning: "Delete would be permanent, you can’t restore issues later.",
        spesificDelete: `Are you sure you want to delete “{title}”?`,
      },
    },
    ru: {
      setProject: "Поменять проект",
      delete: "Удалить",

      deleteModal: {
        multipleDelete: `Вы уверенны, что хотите удалить 0 элементов? | Вы уверенны, что хотите удалить {length} элемент? | Вы уверенны, что хотите удалить {length} элемента? | Вы уверенны, что хотите удалить {length} элементов?`,
        warning:
          "Удаление будет пермонентным, вы не сможете восстановить драфты",
        spesificDelete: `Вы уверены, что хотети удалить “{title}”?`,
      },
    },
  },
});

const selectedDraftIds = ref([]);
const selectedTaskIds = ref([]);

const commandEl = ref<InstanceType<typeof CommandPalette>>(null);
const totalCount = computed(() => {
  return selectedDraftIds.value.length + selectedTaskIds.value.length;
});
watch(totalCount, (val) => {
  if (!commandEl.value) return;

  if (val > 0) {
    animate(commandEl.value.$el, {
      transform: "translateY(-50%) translateX(-50%)",
    });
  } else {
    animate(commandEl.value.$el, {
      transform: "translateY(100%) translateX(-50%)",
    });
  }
});

function onDiscard() {
  selectedDraftIds.value = [];
  selectedTaskIds.value = [];
}

const projectModalStore = useProjectModalStore();

async function onDelete() {
  draftStore.remove(selectedDraftIds.value);
  taskStore.remove(selectedTaskIds.value);

  selectedDraftIds.value = [];
  selectedTaskIds.value = [];
}

async function onSetProject() {
  const projectId = await projectModalStore.use({ hintText: "change" });
  if (!projectId) return;

  draftStore.setProject(selectedDraftIds.value, projectId);
  taskStore.setProject(selectedTaskIds.value, projectId);

  selectedDraftIds.value = [];
  selectedTaskIds.value = [];
}
</script>

<template>
  <div class="flex h-[100vh] flex-col space-y-4 py-8">
    <!--  Inbox section-->
    <PlanInbox
      v-model:integration-drafts="integrationDrafts"
      v-model:selected-draft-ids="selectedDraftIds"
      :activated-integrations="activatedIntegrations"
    >
    </PlanInbox>
    <!--    Date columns-->
    <PlanPlanner
      class="grow"
      v-model:integration-drafts="integrationDrafts"
      v-model:selected-task-ids="selectedTaskIds"
    ></PlanPlanner>
  </div>
  <CommandPalette
    ref="commandEl"
    class="fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
    :selected-count="totalCount"
    :commands="[
      { name: t('setProject'), icon: 'hashtag', emitName: 'setProject' },
      { name: t('delete'), icon: 'basket', emitName: 'remove' },
    ]"
    @discard="onDiscard"
    @remove="onDelete"
    @setProject="onSetProject"
  ></CommandPalette>
</template>
