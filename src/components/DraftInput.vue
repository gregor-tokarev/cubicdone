<script setup lang="ts">
import Icon from "./Icon.vue";
import { computed, onMounted, ref, watch } from "vue";
import { InputGenericPart } from "../models/input-part.model.ts";
import { nanoid } from "nanoid";
import Contenteditable from "./Contenteditable.vue";
import { useProjectStore } from "../store/project.ts";
import { Project } from "../models/project.model.ts";
import Fuse from "fuse.js";
import { focusOnEditableElement } from "../utils/focus.ts";
import FuseResult = Fuse.FuseResult;

const props = defineProps<{
  placeholder: string;
  modelValue: InputGenericPart[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: InputGenericPart[]): void;
  (e: "enter", value: void): void;
}>();

const projectStore = useProjectStore();

onMounted(() => {
  if (!partsContainer.value) return;
  focusOnEditableElement(partsContainer.value.children[0] as HTMLElement);
});

const partsContainer = ref<HTMLElement | null>(null);
const currentPartIdx = ref(0);

function onFocus(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  if (!target || !partsContainer.value) return;

  currentPartIdx.value = Array.from(partsContainer.value.children).indexOf(
    target,
  );
}

watch(currentPartIdx, (newValue) => {
  const part = props.modelValue[newValue];

  openProjectSearch.value = part.type === "project";

  if (part.type !== "project") {
    projectQuery.value = "";
    projectQueryResult.value = [];
    projectOptionSelected.value = 0;
  }
});

function onUpdate(event: Event) {
  const evt = event as KeyboardEvent;

  const target = evt.target as HTMLElement;
  if (!target) return;

  const currentPart = props.modelValue[currentPartIdx.value];

  if (evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
    handleArrows(evt);
  }

  if (currentPart.type === "text") {
    handleText(evt);
  } else if (currentPart.type === "project") {
    handleProject(evt);
  }
}

function handleArrows(evt: KeyboardEvent) {
  if (!partsContainer.value) return;

  const selection = document.getSelection();
  if (!selection || !selection.focusNode || !selection.focusNode.textContent)
    return;

  if (
    evt.key === "ArrowLeft" &&
    currentPartIdx.value !== 0 &&
    selection.focusOffset === 0
  ) {
    focusOnEditableElement(
      partsContainer.value.children[currentPartIdx.value - 1] as HTMLElement,
    );
  } else if (
    evt.key === "ArrowRight" &&
    currentPartIdx.value !== props.modelValue.length - 1 &&
    selection.focusOffset === selection.focusNode.textContent.length
  ) {
    focusOnEditableElement(
      partsContainer.value.children[currentPartIdx.value + 1] as HTMLElement,
      "start",
    );
  }
}

function handleText(evt: KeyboardEvent) {
  if (evt.key === "#") {
    handleTextHashtag(evt);
  } else if (evt.key === "Backspace") {
    handleTextBackspace(evt);
  } else if (evt.key === "Enter") {
    handleTextEnter(evt);
  }
}

/**
 * Triggers every time something typed in project block
 * @param evt
 */
function handleProject(evt: KeyboardEvent) {
  const currentPart = props.modelValue[currentPartIdx.value];

  setTimeout(() => {
    if (evt.code !== "ArrowUp" && evt.code !== "ArrowDown")
      projectQuery.value = currentPart.content.replace(/#/g, "");
  });

  if (evt.code === "Backspace") {
    handleProjectBackspace(evt);
  } else if (evt.code === "Enter") {
    handleProjectEnter(evt);
  } else if (evt.code === "ArrowUp" || evt.code === "ArrowDown") {
    handleProjectArrows(evt);
  }
}

function handleTextEnter(evt: KeyboardEvent) {
  evt.preventDefault();

  setTimeout(() => {
    emit("enter");

    emit("update:modelValue", [{ type: "text", content: "", id: nanoid(3) }]);
    currentPartIdx.value = 0;

    setTimeout(() => {
      if (!partsContainer.value) return;
      focusOnEditableElement(partsContainer.value.children[0] as HTMLElement);
    });
  });
}

/**
 * Triggers every time `#` typed in text block
 * @param evt
 */
function handleTextHashtag(evt: KeyboardEvent) {
  evt.preventDefault();

  const projectPart = {
    type: "project",
    projectId: null,
    id: nanoid(3),
    content: "#",
  };
  const tempValue = JSON.parse(JSON.stringify(props.modelValue));
  tempValue.splice(currentPartIdx.value + 1, 0, projectPart);

  emit("update:modelValue", tempValue);

  setTimeout(() => {
    if (!partsContainer.value) return;
    const nextNode = partsContainer.value.children[
      currentPartIdx.value + 1
    ] as HTMLElement;

    focusOnEditableElement(nextNode);
  });
}

/**
 * Triggers every time `Backspace` pressed in text block
 * @param _evt
 */
function handleTextBackspace(_evt: KeyboardEvent) {
  const currentPart = props.modelValue[currentPartIdx.value];

  setTimeout(() => {
    if (!partsContainer.value || currentPartIdx.value === 0) return;

    if (currentPart.content === "") {
      const tempValue = JSON.parse(JSON.stringify(props.modelValue));
      tempValue.splice(currentPartIdx.value, 1);
      emit("update:modelValue", tempValue);

      const focusNode = partsContainer.value.children[
        currentPartIdx.value - 1
      ] as HTMLElement;
      focusOnEditableElement(focusNode);
    }
  });
}

const projectQuery = ref("");
const projectQueryResult = ref<FuseResult<Project>[]>([]);
const openProjectSearch = ref(false);

const projectSelectOptions = computed<Project[]>(() => {
  return projectQuery.value
    ? projectQueryResult.value.map((r) => r.item)
    : projectStore.projects;
});

const projectOptionSelected = ref(0);
watch(projectQuery, (newValue) => {
  const searchIndex = projectStore.getIndex;

  projectQueryResult.value = searchIndex.search(newValue);
});

/**
 * Triggers every time `Backspace` pressed in project block
 * @param _evt
 */
function handleProjectBackspace(_evt: KeyboardEvent) {
  const currentPart = props.modelValue[currentPartIdx.value];

  setTimeout(() => {
    if (!partsContainer.value) return;

    if (currentPart.content === "") {
      const tempValue = JSON.parse(JSON.stringify(props.modelValue));
      tempValue.splice(currentPartIdx.value, 1);
      emit("update:modelValue", tempValue);

      const focusNode = partsContainer.value.children[
        currentPartIdx.value - 1
      ] as HTMLElement;
      focusOnEditableElement(focusNode);

      projectQuery.value = "";
      openProjectSearch.value = false;
    }
  });
}

/**
 * Triggers every time `Enter` pressed in project block
 * @param evt
 */
function handleProjectEnter(evt: KeyboardEvent) {
  evt.preventDefault();

  const tempValue = JSON.parse(JSON.stringify(props.modelValue));

  if (projectOptionSelected.value === projectSelectOptions.value.length) {
    const project = projectStore.create(projectQuery.value);

    const tempValue = JSON.parse(JSON.stringify(props.modelValue));
    tempValue[currentPartIdx.value].projectId = project.id;

    emit("update:modelValue", tempValue);
  } else {
    tempValue[currentPartIdx.value].projectId =
      projectQueryResult.value[projectOptionSelected.value].item.id;

    emit("update:modelValue", tempValue);
  }

  openProjectSearch.value = false;
  projectQuery.value = "";

  const textPart = { id: nanoid(3), content: "", type: "text" };

  tempValue.push(textPart);

  emit("update:modelValue", tempValue);

  setTimeout(() => {
    props.modelValue.forEach((p, idx) => {
      if (
        p.type === "project" &&
        p.id !== props.modelValue[currentPartIdx.value].id
      ) {
        const tempValue = JSON.parse(JSON.stringify(props.modelValue));
        tempValue.splice(idx, 1, {
          ...p,
          type: "text",
          projectId: undefined,
        });
        emit("update:modelValue", tempValue);
      }
    });

    if (!partsContainer.value) return;
    const focusElement = partsContainer.value.children[
      currentPartIdx.value + 1
    ] as HTMLElement;
    focusOnEditableElement(focusElement);
  });
}

/**
 * Triggers every time Arrow keys get pressed in project block
 * @param evt
 */
function handleProjectArrows(evt: KeyboardEvent) {
  evt.preventDefault();

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

  if (projectSelectOptions.value[projectOptionSelected.value]) {
    const tempValue = JSON.parse(JSON.stringify(props.modelValue));
    tempValue[currentPartIdx.value].content =
      "#" + projectSelectOptions.value[projectOptionSelected.value].title;
    emit("update:modelValue", tempValue);
  }
}
</script>

<template>
  <div class="relative">
    <!--    Input box-->
    <div class="flex items-center rounded-lg bg-gray-400 px-2.5 py-1">
      <Icon name="plus" class="mr-1.5 text-gray-350"></Icon>
      <div
        class="flex grow items-center space-x-1"
        @keydown="onUpdate($event)"
        ref="partsContainer"
      >
        <template v-for="part in modelValue" :key="part.id">
          <Contenteditable
            class="outline-0"
            tag="p"
            :class="{ grow: modelValue.length === 1 }"
            v-if="part.type === 'text'"
            @focus="onFocus($event)"
            v-model="part.content"
          >
          </Contenteditable>
          <Contenteditable
            class="rounded-lg bg-gray-450 px-[3px] py-[2.5px] outline-0"
            :class="{
              [`!bg-${
                'projectId' in part &&
                part.projectId &&
                projectStore.getOne(part.projectId)?.color
              }-100`]: 'projectId' in part && part.projectId,
              [`!text-${
                'projectId' in part &&
                part.projectId &&
                projectStore.getOne(part.projectId)?.color
              }-400`]: 'projectId' in part && part.projectId,
            }"
            tag="p"
            v-else-if="part.type === 'project'"
            v-model="part.content"
            @focus="onFocus($event)"
          >
          </Contenteditable>
        </template>
      </div>
    </div>
    <!--    Project select-->
    <div
      v-if="openProjectSearch"
      class="absolute bottom-0 left-0 right-0 translate-y-[calc(100%+4px)] rounded-lg bg-gray-400 py-1.5"
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
      <div
        v-if="projectQuery"
        class="flex items-center space-x-1.5 px-2.5 py-1.5"
        :class="{
          'bg-gray-450': projectOptionSelected === projectSelectOptions.length,
        }"
      >
        Create Project "{{ projectQuery }}"
      </div>
    </div>
  </div>
</template>

<style scoped></style>
