<script setup lang="ts">
import { Project } from "@models/project.model.ts";
import Icon from "./Icon.vue";

defineProps<{
  project: Project;
  active: boolean;
  check: boolean;
}>();
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-between px-2.5 py-1.5 transition-colors hover:bg-gray-300"
    :class="{ 'bg-gray-300': active }"
  >
    <!--        Color circle-->
    <div class="flex items-center space-x-1.5">
      <div
        class="h-[11px] w-[11px] rounded-full"
        :class="{ [`bg-${project.color}-400`]: true }"
      ></div>
      <span>{{ project.title }}</span>
    </div>
    <Icon v-if="check" name="check" class="text-gray-800"></Icon>
  </div>
</template>
