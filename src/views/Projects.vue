<script setup lang="ts">
import { useProjectStore } from "../store/project.ts";
import ProjectRow from "../components/cards/ProjectRow.vue";
import { Project } from "../models/project.model.ts";
import { ref } from "vue";
import { focusOnEditableElement } from "../utils/focus.ts";

const projectStore = useProjectStore();

const rowsContainer = ref<HTMLElement | null>(null);

function onUpdateProject(id: string, project: Partial<Project>) {
  if (project?.title === "") return;

  projectStore.edit(id, project);
}

function onCreateProject() {
  projectStore.create("");

  setTimeout(() => {
    if (!rowsContainer.value) return;

    focusOnEditableElement(
      rowsContainer.value.children[0].querySelector(
        "[contenteditable]",
      ) as HTMLElement,
    );
  });
}
</script>

<template>
  <div class="pt-8">
    <div class="mb-6 flex items-center space-x-5">
      <h1 class="text-xl">Projects</h1>
      <div
        @click="onCreateProject()"
        class="cursor-pointer rounded-lg px-1.5 py-[3px] text-gray-350 transition-colors hover:bg-gray-400"
      >
        New project +
      </div>
    </div>
    <div ref="rowsContainer" class="">
      <ProjectRow
        :project="row.project"
        :draft-count="row.draftCount"
        :task-active-count="row.taskActiveCount"
        :task-completed-count="row.taskCompletedCount"
        :key="row.project.id"
        v-for="row in projectStore.withStatistics"
        @update="onUpdateProject(row.project.id, $event)"
      ></ProjectRow>
    </div>
  </div>
</template>
