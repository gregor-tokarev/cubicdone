<script setup lang="ts">
import { useProjectModalStore } from "@store/select-modal.ts";
import { useProjectStore } from "@store/project.ts";
import { computed, ref } from "vue";
import SelectModal from "./SelectModal.vue";

const projectModalStore = useProjectModalStore();
const projectStore = useProjectStore();

const query = ref("");

const projectOptions = computed(() => {
  const searchIndex = projectStore.getIndex;
  const searchResults = searchIndex.search(query.value);

  const result = query.value
    ? searchResults.map((r) => r.item)
    : projectStore.rankedProjects;

  return result.map((project) => ({
    id: project.id,
    text: project.title,
    color: project.color,
  }));
});

function onSubmit(id: string) {
  projectModalStore.resolveFn && projectModalStore.resolveFn(id);
}

const open = computed({
  get() {
    return projectModalStore.open;
  },
  set(value: boolean) {
    if (!value) {
      projectModalStore.close();
      query.value = "";
    }
  },
});

const checkedIndex = computed(() => {
  return projectOptions.value.findIndex(
    (p) => p.id === projectModalStore.modalOptions?.draft?.projectId,
  );
});
</script>

<template>
  <SelectModal
    v-if="projectModalStore.modalOptions"
    :hint-text="projectModalStore.modalOptions?.hintText"
    :checked-index="checkedIndex"
    v-model:query="query"
    :options="projectOptions"
    v-model:open="open"
    @submit="onSubmit"
  />
</template>

<style scoped></style>
@store/select-modal
