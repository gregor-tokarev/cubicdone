<script setup lang="ts">
import { useProjectModalStore } from "@store/project-modal.ts";
import { useProjectStore } from "@store/project.ts";
import ProjectOption from "@components/ProjectOption.vue";
import { computed, ref, watch } from "vue";
import { setScrolling } from "@utils/setScrolling.ts";

const projectModalStore = useProjectModalStore();
const projectStore = useProjectStore();

watch(
  () => projectModalStore.open,
  (value) => {
    selectedProjectIdx.value = 0;

    if (value) {
      setTimeout(() => {
        if (!searchEl.value) return;
        searchEl.value.focus();
      });
      setScrolling(false);
    } else setScrolling(true);
  },
);

const selectedProjectIdx = ref(0);
const searchEl = ref<HTMLInputElement | null>(null);
const query = ref("");
watch(query, (_value) => {
  selectedProjectIdx.value = 0;
});

const projectOptions = computed(() => {
  const searchIndex = projectStore.getIndex;
  const searchResults = searchIndex.search(query.value);

  return query.value
    ? searchResults.map((r) => r.item)
    : projectStore.rankedProjects;
});

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === "ArrowDown" || evt.key === "ArrowUp") onArrow(evt);
  else if (evt.key === "Enter") onEnter(evt);
  else if (evt.key === "Escape") projectModalStore.close();
}

function onArrow(evt: KeyboardEvent) {
  evt.preventDefault();

  if (evt.key === "ArrowDown") {
    if (selectedProjectIdx.value >= projectOptions.value.length - 1)
      selectedProjectIdx.value = 0;
    else selectedProjectIdx.value++;
  } else if (evt.key === "ArrowUp") {
    if (selectedProjectIdx.value < 1)
      selectedProjectIdx.value = projectOptions.value.length - 1;
    else selectedProjectIdx.value--;
  }
}

function onEnter(_evt: KeyboardEvent) {
  const selectedProject = projectOptions.value[selectedProjectIdx.value];

  projectModalStore.resolveFn &&
    projectModalStore.resolveFn(selectedProject.id);
  projectModalStore.close();
}

function onClick(projectId: string) {
  projectModalStore.resolveFn && projectModalStore.resolveFn(projectId);
  projectModalStore.close();
}
</script>

<template>
  <teleport to="[data-scroll-container]">
    <div
      v-if="projectModalStore.open"
      class="fixed left-1/2 top-[100px] z-10 w-[600px] -translate-x-1/2 rounded-md bg-gray-100 pb-4 pt-1.5 shadow-xl"
    >
      <div
        v-if="projectModalStore.modalOptions"
        class="mx-2 mb-2 inline-block rounded bg-gray-300 px-2 text-xs"
      >
        {{ projectModalStore.modalOptions.hintText }}
      </div>
      <input
        type="text"
        ref="searchEl"
        v-model="query"
        @keydown="onKeydown"
        class="border-gray-150 w-full border-b bg-transparent p-2 placeholder-gray-500 outline-0"
        placeholder="Change project..."
      />
      <div v-if="projectModalStore.modalOptions" class="">
        <ProjectOption
          v-for="(p, idx) in projectOptions"
          :project="p"
          :check="
            !!projectModalStore.modalOptions.draft &&
            p.id === projectModalStore.modalOptions.draft.projectId
          "
          :active="selectedProjectIdx === idx"
          @click="onClick(p.id)"
        ></ProjectOption>
      </div>
    </div>
  </teleport>
  <teleport to="body">
    <div
      v-if="projectModalStore.open"
      @click="projectModalStore.close()"
      class="fixed inset-0"
    ></div>
  </teleport>
</template>

<style scoped></style>
