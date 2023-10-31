<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Project } from "@models/project.model.ts";
import Fuse from "fuse.js";
import FuseResult = Fuse.FuseResult;
import { useProjectStore } from "@store/project.ts";
import Icon from "../Icon.vue";

const projectStore = useProjectStore();

const props = defineProps<{
  modelValue: string | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const projectOptionSelected = ref(0);

const projectQuery = ref("");
const projectQueryResult = ref<FuseResult<Project>[]>([]);
const openProjectSearch = ref(false);

const projectSelectOptions = computed<Project[]>(() => {
  return projectQuery.value
    ? projectQueryResult.value.map((r) => r.item)
    : projectStore.rankedProjects;
});

watch(projectQuery, (newValue) => {
  const searchIndex = projectStore.getIndex;

  projectQueryResult.value = searchIndex.search(newValue);
});

const project = computed<Project | undefined>(() => {
  if (!props.modelValue) return;
  return projectStore.getOne(props.modelValue);
});

const inputEl = ref<HTMLInputElement | null>(null);

function handleEnter(_evt: KeyboardEvent) {
  const selectedProject =
    projectSelectOptions.value[projectOptionSelected.value];

  if (
    projectOptionSelected.value === projectSelectOptions.value.length &&
    !queryMatchProject.value
  ) {
    const project = projectStore.create(projectQuery.value);
    emit("update:modelValue", project.id);
  } else {
    emit("update:modelValue", selectedProject.id);
  }

  openProjectSearch.value = false;
  projectQuery.value = "";
}

function handleArrows(evt: KeyboardEvent) {
  if (evt.code === "ArrowUp") {
    if (projectOptionSelected.value < 1) {
      projectOptionSelected.value = projectQueryResult.value.length;
    } else {
      projectOptionSelected.value--;
    }
  } else if (evt.code === "ArrowDown") {
    if (projectOptionSelected.value > projectSelectOptions.value.length - 1) {
      projectOptionSelected.value = 0;
    } else {
      projectOptionSelected.value++;
    }
  }
}

const projectSelect = ref<HTMLElement | null>(null);
const projectSelectBound = computed(() => {
  if (!projectSelect.value) return;

  return projectSelect.value.getBoundingClientRect();
});

const queryMatchProject = computed(() => {
  return projectSelectOptions.value.some(
    (op) => op.title === projectQuery.value,
  );
});

function onClick() {
  if (props.modelValue !== null) {
    emit("update:modelValue", null);

    setTimeout(() => {
      if (inputEl.value) {
        inputEl.value.focus();
      }
    });
  }
}
</script>

<template>
  <div
    ref="projectSelect"
    class="flex cursor-pointer items-center justify-between rounded-lg bg-gray-400 px-2 py-1"
    @click="onClick()"
    :class="{
      [`!bg-${project ? project.color : ''}-100`]: modelValue !== null,
      [`!text-${project ? project.color : ''}-400`]: modelValue !== null,
    }"
  >
    <div class="flex w-full items-center">
      #<input
        v-if="modelValue === null"
        ref="inputEl"
        type="text"
        v-model="projectQuery"
        class="w-full bg-transparent outline-0"
        @keydown.up.down.prevent="handleArrows"
        @keydown.enter.prevent="handleEnter"
        @focus="openProjectSearch = true"
        @blur="openProjectSearch = false"
      />
      <span v-else-if="project">
        {{ project.title }}
      </span>
    </div>
    <Icon v-if="modelValue !== null" name="cancel"></Icon>
  </div>
  <teleport to="body">
    <div
      v-if="openProjectSearch && projectSelectBound"
      class="absolute left-10 top-10 rounded-lg bg-gray-400 py-1.5"
      :style="{
        left: projectSelectBound.left + 'px',
        top: projectSelectBound.top + projectSelectBound.height + 6 + 'px',
        width: projectSelectBound.width + 'px',
      }"
    >
      <!--      Project item-->
      <template v-if="projectSelectOptions">
        <div
          v-for="(p, idx) in projectSelectOptions"
          class="flex items-center space-x-1.5 px-2.5 py-1.5"
          :class="{ 'bg-gray-450': projectOptionSelected === idx }"
        >
          <!--        Color circle-->
          <div
            class="h-[11px] w-[11px] rounded-full bg-amber-400"
            :class="{ [`bg-${p.color}-400`]: true }"
          ></div>
          <span>{{ p.title }}</span>
        </div>
      </template>
      <!--      <div
        v-if="projectQuery && !queryMatchProject"
        class="flex items-center space-x-1.5 px-2.5 py-1.5"
        :class="{
          'bg-gray-450': projectOptionSelected === projectSelectOptions.length,
        }"
      >
        Create Project "{{ projectQuery }}"
      </div>-->
    </div>
  </teleport>
</template>

<style scoped></style>
