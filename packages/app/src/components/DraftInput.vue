<script setup lang="ts">
import Icon from "./Icon.vue";
import { computed, onMounted, ref, watch } from "vue";
import { InputGenericPart } from "@models/input-part.model.ts";
import { nanoid } from "nanoid";
import Contenteditable from "./Contenteditable.vue";
import { useProjectStore } from "@store/project.ts";
import { Project } from "@models/project.model.ts";
import Fuse from "fuse.js";
import { focusOnEditableElement, setCursorPosition } from "@utils/focus.ts";
import SelectModalOption from "@components/SelectModalOption.vue";
import { replaceAt } from "@utils/replaceAt.ts";
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
const root = ref<HTMLElement | null>(null);

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

  evt.stopPropagation();

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
  } else if (evt.key === "`") {
    handleBackticks(evt);
  } else if (evt.key === "Backspace") {
    handleTextBackspace(evt);
  } else if (evt.key === "Enter") {
    handleTextEnter(evt);
  } else if (evt.key === "Escape") {
    handleTextEscape(evt);
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
  } else if (evt.key === "Escape") {
    handleProjectEscape(evt);
  }
}

function handleBackticks(evt: KeyboardEvent) {
  evt.preventDefault();

  const sel = window.getSelection();
  const range = sel?.getRangeAt(0);
  const offset = range?.startOffset;
  if (offset === undefined) return;

  const tempValue = JSON.parse(JSON.stringify(props.modelValue));
  tempValue[currentPartIdx.value].content = replaceAt(
    tempValue[currentPartIdx.value].content,
    offset,
    "``",
  );
  emit("update:modelValue", tempValue);

  if (!partsContainer.value) return;
  const currentNode = partsContainer.value.children[
    currentPartIdx.value
  ] as HTMLElement;

  setTimeout(() => {
    setCursorPosition(currentNode, offset + 1);
  });
}

function handleTextEnter(evt: KeyboardEvent) {
  evt.preventDefault();

  const totalStr = props.modelValue
    .filter((p) => p.type === "text")
    .reduce((acc, a) => (acc += a.content), "");

  if (totalStr === "") return;
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

function handleTextEscape(_evt: KeyboardEvent) {
  if (!partsContainer.value) return;

  const currentPart = partsContainer.value.children[currentPartIdx.value];
  // @ts-ignore
  currentPart.blur();
}

/**
 * Triggers every time `Backspace` pressed in text block
 * @param _evt
 */
function handleTextBackspace(_evt: KeyboardEvent) {
  const currentPart = props.modelValue[currentPartIdx.value];

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
}

const projectQuery = ref("");
const projectQueryResult = ref<FuseResult<Project>[]>([]);
const openProjectSearch = ref(false);

const projectSelectBound = computed(() => {
  if (!root.value) return;

  return root.value.getBoundingClientRect();
});

const projectSelectOptions = computed<Project[]>(() => {
  console.log(projectStore.rankedProjects);

  return projectQuery.value
    ? projectQueryResult.value.map((r) => r.item)
    : projectStore.rankedProjects;
});

const projectOptionSelected = ref(0);
watch(projectQuery, (newValue) => {
  const searchIndex = projectStore.getIndex;

  projectQueryResult.value = searchIndex.search(newValue);
});

const queryMatchProject = computed(() => {
  return projectSelectOptions.value.some(
    (op) => op.title === projectQuery.value,
  );
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

function handleProjectEscape(_evt: KeyboardEvent) {
  const tempValue = JSON.parse(JSON.stringify(props.modelValue));
  tempValue.splice(currentPartIdx.value, 1);

  emit("update:modelValue", tempValue);

  const idx = currentPartIdx.value;
  setTimeout(() => {
    if (!partsContainer.value) return;
    focusOnEditableElement(
      partsContainer.value.children[idx - 1] as HTMLElement,
    );
  });
}

function onClickProject(projectId: string) {
  const project = projectSelectOptions.value.find((p) => p.id === projectId);
  if (!project) return;

  const tempValue = JSON.parse(JSON.stringify(props.modelValue));

  tempValue[currentPartIdx.value].projectId = projectId;
  tempValue[currentPartIdx.value].content = "#" + project.title;

  afterAddProject(tempValue);
}

/**
 * Triggers every time `Enter` pressed in project block
 * @param evt
 */
async function handleProjectEnter(evt: KeyboardEvent) {
  evt.preventDefault();

  const tempValue = JSON.parse(JSON.stringify(props.modelValue));

  if (
    projectOptionSelected.value === projectSelectOptions.value.length &&
    !queryMatchProject.value
  ) {
    const project = await projectStore.create(projectQuery.value);

    tempValue[currentPartIdx.value].projectId = project.id;
  } else {
    const selectedOption =
      projectSelectOptions.value[projectOptionSelected.value];

    tempValue[currentPartIdx.value].projectId = selectedOption.id;
    tempValue[currentPartIdx.value].content = "#" + selectedOption.title;
  }

  openProjectSearch.value = false;
  projectQuery.value = "";

  emit("update:modelValue", tempValue);

  afterAddProject(tempValue);
}

function afterAddProject(tempValue: any) {
  const textPart = { id: nanoid(3), content: "", type: "text" };
  tempValue.push(textPart);

  props.modelValue.forEach((p, idx) => {
    if (
      p.type === "project" &&
      p.id !== props.modelValue[currentPartIdx.value].id
    ) {
      tempValue.splice(idx, 1, {
        ...p,
        type: "text",
        projectId: undefined,
      });
    }
  });

  emit("update:modelValue", tempValue);

  setTimeout(() => {
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

function focusOnCurrentNode() {
  if (!partsContainer.value) return;

  const node = partsContainer.value.children[currentPartIdx.value];
  focusOnEditableElement(node as HTMLElement);
}

defineExpose({
  focusOnCurrentNode,
});
</script>

<template>
  <div class="relative" ref="root">
    <!--    Input box-->
    <div class="flex items-center rounded-lg bg-gray-100 px-2.5 py-1">
      <Icon name="plus" :size="24" class="mr-1.5 text-gray-600"></Icon>
      <div
        class="flex grow items-center space-x-1"
        @keydown="onUpdate($event)"
        ref="partsContainer"
      >
        <template v-for="(part, idx) in modelValue" :key="part.id">
          <Contenteditable
            class="outline-0"
            tag="p"
            :class="{
              grow: modelValue.length - 1 === idx || modelValue.length === 0,
            }"
            v-if="part.type === 'text'"
            @focus="onFocus($event)"
            v-model="part.content"
          >
          </Contenteditable>
          <Contenteditable
            class="rounded-lg bg-gray-300 px-[3px] py-[2.5px] leading-[120%] outline-0"
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
    <teleport to="body">
      <div
        v-if="openProjectSearch && projectSelectBound"
        class="absolute left-10 top-10 rounded-lg bg-gray-100 py-1.5"
        :style="{
          left: projectSelectBound.left + 'px',
          top: projectSelectBound.top + projectSelectBound.height + 10 + 'px',
          width: projectSelectBound.width + 'px',
        }"
      >
        <!--      Project item-->
        <template v-if="projectSelectOptions">
          <SelectModalOption
            v-for="(p, idx) in projectSelectOptions"
            :active="projectOptionSelected === idx"
            :option="{ id: p.id, text: p.title, color: p.color }"
            :check="false"
            @click="onClickProject(p.id)"
          />
        </template>
        <div
          v-if="projectQuery && !queryMatchProject"
          class="flex items-center space-x-1.5 px-2.5 py-1.5"
          :class="{
            'bg-gray-300':
              projectOptionSelected === projectSelectOptions.length,
          }"
        >
          Create Project "{{ projectQuery }}"
        </div>
      </div>
    </teleport>
  </div>
</template>
