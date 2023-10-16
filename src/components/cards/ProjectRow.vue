<script setup lang="ts">
import { Project } from "../../models/project.model.ts";
import { useProjectStore } from "../../store/project.ts";
import { computed, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

const projectStore = useProjectStore();

defineProps<{
  project: Project;
  draftCount: number;
  taskCompletedCount: number;
  taskActiveCount: number;
}>();

const emit = defineEmits<{
  (e: "update", value: Partial<Project>): void;
}>();

const showColorPicker = ref(false);
const colorPicker = ref<HTMLElement | null>(null);
const color = ref<HTMLElement | null>(null);

onClickOutside(colorPicker, () => {
  showColorPicker.value = false;
});

const colorBound = computed(() => {
  if (!color.value) return;

  return color.value.getBoundingClientRect();
});

function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement;
  const value = target.textContent;

  value && emit("update", { title: value });
}

function onPickColor(color: string) {
  emit("update", { color });

  showColorPicker.value = false;
}

function onEnter(event: Event) {
  const target = event.currentTarget as HTMLElement;
  target.blur();
}
</script>

<template>
  <div class="flex items-center border-b border-gray-400 py-[18px]">
    <div class="flex w-[38%] items-center space-x-2">
      <div
        ref="color"
        @click="showColorPicker = !showColorPicker"
        class="hover:shadow-colorPick h-5 w-5 cursor-pointer rounded-full"
        :class="{ [`bg-${project.color}-400`]: true }"
      ></div>
      <span>
        #<span
          class="outline-0"
          contenteditable="true"
          @input="onEditDraft"
          @keydown.enter.prevent="onEnter"
        >
          {{ project.title }}
        </span>
      </span>
    </div>
    <div class="w-[20%]">
      {{ taskActiveCount }}
    </div>
    <div class="w-[32%]">
      {{ taskCompletedCount }}
    </div>
    <div class="">
      {{ draftCount }}
    </div>
  </div>
  <teleport to="body">
    <div
      v-if="showColorPicker && colorBound"
      ref="colorPicker"
      class="fixed flex w-[156px] -translate-x-1/2 flex-wrap gap-2.5 rounded-lg bg-white p-2 shadow"
      :style="{
        top: colorBound.top + colorBound.height + 4 + 'px',
        left: colorBound.left + 'px',
      }"
    >
      <div
        v-for="c in projectStore.colors"
        :key="c"
        class="hover:shadow-colorPick h-5 w-5 cursor-pointer rounded-full border"
        :class="{ [`bg-${c}-400`]: true, 'border-black': c === project.color }"
        @click="onPickColor(c)"
      ></div>
    </div>
  </teleport>
</template>

<style scoped></style>
