<script setup lang="ts">
import { useProjectStore } from "@store/project.ts";
import { computed } from "vue";

const props = defineProps<{
  projectId: string;
}>();

const projectStore = useProjectStore();
const project = computed(() => {
  return projectStore.getOne(props.projectId);
});
</script>

<template>
  <div
    v-if="project"
    class="rounded-lg px-1.5 py-1 text-xs leading-3"
    :class="{
      [`!bg-${project.color}-100`]: project,
      [`!text-${project.color}-400`]: project,
    }"
  >
    #{{ project.title }}
  </div>
</template>

<style scoped></style>
