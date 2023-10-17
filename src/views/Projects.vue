<script setup lang="ts">
import { useProjectStore } from "../store/project.ts";
import ProjectRow from "../components/cards/ProjectRow.vue";
import { Project, ProjectStatistic } from "../models/project.model.ts";
import { computed, ref } from "vue";
import { focusOnEditableElement } from "../utils/focus.ts";
import Icon from "../components/Icon.vue";
import hotkeys from "hotkeys-js";
import { useLocalStorage } from "@vueuse/core";

const projectStore = useProjectStore();

const rowsContainer = ref<HTMLElement | null>(null);

function onUpdateProject(id: string, project: Partial<Project>) {
  if (project?.title === "") return;

  projectStore.edit(id, project);
}

hotkeys("C", () => {
  onCreateProject();
});
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

const sortField = useLocalStorage("projectSortField", "");
const sortDirection = useLocalStorage("projectSortDirection", "");

function getValue(obj: Record<string, any>, path: string): any {
  if (!path) return obj;

  const properties = path.split(".");
  const nextKey = properties.shift();
  if (!nextKey) return obj;

  return getValue(obj[nextKey], properties.join("."));
}

const sortedProjects = computed(() => {
  const v: ProjectStatistic[] = JSON.parse(
    JSON.stringify(projectStore.withStatistics),
  );

  return sortDirection.value && sortField.value
    ? v.sort((prev, next) => {
        if (!sortField.value) return 0;

        if (sortDirection.value === "desc")
          return (
            getValue(prev, sortField.value) - getValue(next, sortField.value)
          );
        else if (sortDirection.value === "asc")
          return (
            getValue(next, sortField.value) - getValue(prev, sortField.value)
          );
        else return 0;
      })
    : projectStore.withStatistics;
});

function onSort(field: string, direction: "desc" | "asc") {
  if (sortField.value === field && sortDirection.value === direction) {
    sortField.value = "";
    sortDirection.value = "";
    return;
  }

  sortField.value = field;
  sortDirection.value = direction;
}
</script>

<template>
  <div class="pt-8">
    <div class="mb-6 flex items-center space-x-5">
      <h1 class="text-xl">Projects</h1>
      <div
        v-hint="'C'"
        @click="onCreateProject()"
        class="cursor-pointer rounded-lg px-1.5 py-[3px] text-gray-350 transition-colors hover:bg-gray-400"
      >
        New project +
      </div>
    </div>
    <div class="flex items-center space-x-0.5">
      <div class="flex w-[38%] items-center pl-[2%] text-xs text-gray-350">
        <span> name </span>
        <div class="text-gray-350"></div>
      </div>
      <div class="flex w-[20%] items-center text-xs text-gray-350">
        <span> active tasks </span>
        <div class="text-gray-350">
          <Icon
            class="cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('taskActiveCount', 'asc')"
            :class="{
              'text-black':
                sortField === 'taskActiveCount' && sortDirection === 'asc',
            }"
          ></Icon>
          <Icon
            class="rotate-180 cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('taskActiveCount', 'desc')"
            :class="{
              'text-black':
                sortField === 'taskActiveCount' && sortDirection === 'desc',
            }"
          ></Icon>
        </div>
      </div>
      <div class="flex w-[32%] items-center text-xs text-gray-350">
        <span> completed tasks </span>
        <div class="text-gray-350">
          <Icon
            class="cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('taskCompletedCount', 'asc')"
            :class="{
              'text-black':
                sortField === 'taskCompletedCount' && sortDirection === 'asc',
            }"
          ></Icon>
          <Icon
            class="rotate-180 cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('taskCompletedCount', 'desc')"
            :class="{
              'text-black':
                sortField === 'taskCompletedCount' && sortDirection === 'desc',
            }"
          ></Icon>
        </div>
      </div>
      <div class="flex items-center text-xs text-gray-350">
        <span> drafts </span>
        <div class="text-gray-350">
          <Icon
            class="cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('draftCount', 'asc')"
            :class="{
              'text-black':
                sortField === 'draftCount' && sortDirection === 'asc',
            }"
          ></Icon>
          <Icon
            class="rotate-180 cursor-pointer transition-colors hover:text-black"
            name="arrow"
            @click="onSort('draftCount', 'desc')"
            :class="{
              'text-black':
                sortField === 'draftCount' && sortDirection === 'desc',
            }"
          ></Icon>
        </div>
      </div>
    </div>
    <div ref="rowsContainer" class="">
      <ProjectRow
        :project="row.project"
        :draft-count="row.draftCount"
        :task-active-count="row.taskActiveCount"
        :task-completed-count="row.taskCompletedCount"
        :key="row.project.id"
        v-for="row in sortedProjects"
        @update="onUpdateProject(row.project.id, $event)"
      ></ProjectRow>
    </div>
  </div>
</template>
