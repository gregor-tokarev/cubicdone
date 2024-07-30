<script setup lang="ts">
import { Project, ProjectStatus } from "contract-models";
import { useProjectStore } from "@store/project.ts";
import { computed, ref, useAttrs } from "vue";
import { onClickOutside, useDebounceFn } from "@vueuse/core";
import Checkbox from "@components/UI/Checkbox.vue";
import { useProjectStatusStore } from "@store/project-status.ts";
import Icon from "@components/Icon.vue";
import { useI18n } from "vue-i18n";

const projectStore = useProjectStore();
const projectStatusStore = useProjectStatusStore();

const attrs = useAttrs();

const { t } = useI18n({
  messages: {
    en: {
      "not started": "not started",
      "in progress": "in progress",
      finished: "finished",
    },
    ru: {
      "not started": "Не начат",
      "in progress": "В прогрессе",
      finished: "Завершен",
    },
  },
});

const props = defineProps<{
  project: Project;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "update", value: Partial<Project>): void;
  (e: "update:selected", value: boolean): void;
  (e: "setStatus", value: void): void;
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

const projectStatus = computed<ProjectStatus | undefined>(() => {
  if (!props.project.statusId) return;

  return projectStatusStore.projectStatuses.find(
    (ps) => ps.id === props.project.statusId,
  );
});

function editDraft(event: Event) {
  const target = event.target as HTMLElement;
  const value = target.textContent;

  value && emit("update", { title: value });
}

const onEditDraft = useDebounceFn(editDraft, 1000);

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
  <div
    class="flex cursor-pointer items-center border-b border-gray-400 py-5 transition-colors hover:bg-gray-50"
    :class="{ '!border-black bg-gray-50': selected }"
    v-bind="attrs"
  >
    <Checkbox
      class="mr-2"
      :model-value="selected"
      @update:model-value="emit('update:selected', $event)"
    ></Checkbox>
    <div class="flex w-[56%] items-center space-x-2">
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
    <div
      class="flex cursor-pointer items-center space-x-1.5 rounded px-2 py-1 text-xs capitalize text-gray-800 transition-colors hover:bg-gray-100"
      @click="emit('setStatus')"
    >
      <template v-if="projectStatus">
        <Icon :name="projectStatus?.icon" :size="14"></Icon>
        <span>{{ t(projectStatus?.title) }}</span>
      </template>
      <template v-else>
        <span>Set status</span>
      </template>
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
