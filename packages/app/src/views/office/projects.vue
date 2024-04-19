<script setup lang="ts">
import ContextMenu from "@components/ContextMenu.vue";
import ProjectStatusModal from "@components/SelectModals/ProjectStatusModal.vue";
import ProjectRow from "@components/cards/ProjectRow.vue";
import { Project } from "contract-models";
import { useProjectStatusModalStore } from "@store/select-modal.ts";
import { useProjectStore } from "@store/project.ts";
import { focusOnEditableElement } from "@utils/focus.ts";
import { setScrolling } from "@utils/setScrolling";
import hotkeys from "hotkeys-js";
import { useDeleteModalStore } from "@store/delete-modal";
import { nanoid } from "nanoid";
import { onMounted, onUnmounted, ref } from "vue";

const projectStore = useProjectStore();
const projectStatusModalStore = useProjectStatusModalStore();

const rowsContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  await projectStore.loadProjects();

  hotkeys("C", onCreateProject);

  hotkeys("x", () => {
    if (hoveredProjectId.value) {
      updateSelection(hoveredProjectId.value);
    }
  });

  hotkeys("cmd+backspace", () => {
    removeProject();
  });

  hotkeys("S", () => {
    onSetStatus();
  });

  hotkeys("esc", () => {
    selectedProjectsIds.value = [];
  });
});

onUnmounted(() => {
  hotkeys.unbind("C", "all", onCreateProject);
});

function onUpdateProject(id: string, project: Partial<Project>) {
  if (project?.title === "") return;

  projectStore.edit(id, project);
}

function onCreateProject() {
  projectStore.create("");

  setTimeout(() => {
    if (!rowsContainer.value) return;

    const addedElement = Array.from(rowsContainer.value.children).find((el) => {
      const editable = el.querySelector("[contenteditable]")!;
      return editable.textContent === "";
    });

    addedElement?.scrollIntoView();
    addedElement &&
      focusOnEditableElement(
        addedElement.querySelector("[contenteditable]") as HTMLElement,
      );
  });
}

const selectedProjectsIds = ref<string[]>([]);

function updateSelection(projectId: string) {
  if (selectedProjectsIds.value.includes(projectId)) {
    const idx = selectedProjectsIds.value.findIndex((id) => id === projectId);
    selectedProjectsIds.value.splice(idx, 1);
    return;
  }

  selectedProjectsIds.value.push(projectId);
}

async function onSetStatus() {
  if (selectedProjectsIds.value.length <= 0) {
    if (!hoveredProjectId.value) return;

    const project = projectStore.getOne(hoveredProjectId.value);
    if (!project) return;

    selectedProjectsIds.value = [];

    const statusId = await projectStatusModalStore.use({
      hintText: project.title,
      statusId: project.statusId,
    });

    projectStore.edit(project.id, { statusId });

    return;
  }

  const statusId = await projectStatusModalStore.use({
    hintText: `Update ${selectedProjectsIds.value.length} projects`,
    statusId: null,
  });

  selectedProjectsIds.value.forEach((id) => {
    projectStore.edit(id, { statusId });
  });

  selectedProjectsIds.value = [];
}

const deleteModalStore = useDeleteModalStore();
async function removeProject() {
  if (selectedProjectsIds.value.length) {
    const res = await deleteModalStore.use({
      titleText: `Are you sure you want to delete ${selectedProjectsIds.value.length} drafts?`,
      descriptionText:
        "Delete would be permanent, you can’t restore projects later.",
    });
    if (!res) return;

    projectStore.remove(selectedProjectsIds.value);
    selectedProjectsIds.value = [];

    return;
  }

  const draft = hoveredProjectId.value
    ? projectStore.getOne(hoveredProjectId.value)
    : null;
  if (!draft) return;

  const res = await deleteModalStore.use({
    titleText: `Are you sure you want to delete “${draft.title}”?`,
    descriptionText:
      "Delete would be permanent, you can’t restore project later.",
  });

  res && projectStore.remove(draft.id);
}

const contextMenuOpen = ref(false);
const hoveredProjectId = ref<string | null>(null);
// const contextMenuEl = ref<InstanceType<typeof ContextMenu> | null>(null);

const clickY = ref(0);
const clickX = ref(0);

function onOpenContextMenu(evt: MouseEvent) {
  clickX.value = evt.clientX;
  clickY.value = evt.clientY;

  contextMenuOpen.value = true;
  setScrolling(false);
}

function onListLeave() {
  if (!contextMenuOpen.value) {
    hoveredProjectId.value = null;
  }
}

function onSelectOption(action: string) {
  if (action === "stat") {
    onSetStatus();
  } else if (action === "del") {
    removeProject();
  }

  contextMenuOpen.value = false;
}
</script>

<template>
  <div class="pt-8">
    <div class="mb-6 flex items-center space-x-5">
      <h1 class="text-xl">Projects</h1>
      <div
        v-hint="'C'"
        @click="onCreateProject()"
        class="cursor-pointer rounded-lg px-1.5 py-[3px] text-gray-600 transition-colors hover:bg-gray-400"
      >
        New project +
      </div>
    </div>
    <div
      v-if="projectStore.projects.length"
      class="flex items-center space-x-0.5"
    >
      <div class="flex w-[59%] items-center pl-[2.4%] text-xs text-gray-600">
        <span> Title </span>
      </div>
      <div class="flex items-center text-xs text-gray-600">
        <span> Status </span>
      </div>
    </div>
    <div
      ref="rowsContainer"
      class=""
      @contextmenu.prevent="onOpenContextMenu"
      @mouseleave="onListLeave"
    >
      <ProjectRow
        v-for="row in projectStore.projects"
        :project="row"
        :key="row.id"
        :selected="selectedProjectsIds.includes(row.id)"
        @mouseenter="hoveredProjectId = row.id"
        @update:selected="updateSelection(row.id)"
        @update="onUpdateProject(row.id, $event)"
        @setStatus="onSetStatus()"
        @contextmenu="onOpenContextMenu"
      ></ProjectRow>
    </div>
  </div>
  <teleport to="body">
    <ContextMenu
      ref="contextMenuEl"
      v-model:show="contextMenuOpen"
      :options="[
        { id: nanoid(3), label: 'Delete', kbd: '⌘ ⌫', value: 'del' },
        { id: nanoid(3), label: 'Set status', kbd: 'S', value: 'stat' },
      ]"
      class="absolute"
      :style="{
        top: `${clickY}px`,
        left: `${clickX}px`,
      }"
      @option="onSelectOption"
    ></ContextMenu>
  </teleport>
  <ProjectStatusModal></ProjectStatusModal>
</template>
@store/select-modal
