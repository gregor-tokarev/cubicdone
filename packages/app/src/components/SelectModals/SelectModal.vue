<script setup lang="ts">
import ProjectOption from "@components/SelectModalOption.vue";
import { ref, watch, watchEffect } from "vue";
import { setScrolling } from "@utils/setScrolling.ts";

const props = defineProps<{
  options: { id: string; icon?: string; color?: string; text: string }[];
  checkedIndex: number;
  open: boolean;
  query: string;
  hintText: string;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:query", value: string): void;
  (e: "submit", value: string): void;
}>();

const selectedProjectIdx = ref(0);

watchEffect(() => {
  selectedProjectIdx.value = 0;

  if (props.open) {
    setTimeout(() => {
      if (!searchEl.value) return;
      searchEl.value.focus();
    });
    setScrolling(false);
  } else {
    setScrolling(true);
  }
});

const searchEl = ref<HTMLInputElement | null>(null);
watch(
  () => props.query,
  (_value) => {
    selectedProjectIdx.value = 0;
  },
);

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === "ArrowDown" || evt.key === "ArrowUp" || (evt.ctrlKey && evt.code === "KeyN" || evt.ctrlKey && evt.code === "KeyP")) onArrow(evt);
  else if (evt.key === "Enter") onEnter(evt);
  else if (evt.key === "Escape") emit("update:open", false);
}

function onArrow(evt: KeyboardEvent) {
  evt.preventDefault();

  if (evt.key === "ArrowDown" || (evt.ctrlKey && evt.code === "KeyN")) {
    if (selectedProjectIdx.value >= props.options.length - 1)
      selectedProjectIdx.value = 0;
    else selectedProjectIdx.value++;
  } else if (evt.key === "ArrowUp" || (evt.ctrlKey && evt.code === "KeyP")) {
    if (selectedProjectIdx.value < 1)
      selectedProjectIdx.value = props.options.length - 1;
    else selectedProjectIdx.value--;
  }
}

function onEnter(_evt: KeyboardEvent) {
  const selectedProject = props.options[selectedProjectIdx.value];

  emit("submit", selectedProject.id);
  emit("update:open", false);
}

function onClick(projectId: string) {
  emit("submit", projectId);
  emit("update:open", false);
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;

  emit("update:query", target.value);
}
</script>

<template>
  <teleport to="[data-scroll-container]">
    <div
      v-if="open"
      class="fixed left-1/2 top-[100px] z-10 w-[600px] -translate-x-1/2 rounded-md bg-gray-100 pb-4 pt-1.5 shadow-xl"
    >
      <div class="mx-2 mb-2 inline-block rounded bg-gray-300 px-2 text-xs">
        {{ hintText }}
      </div>
      <input
        type="text"
        ref="searchEl"
        :value="query"
        @input="onInput"
        @keydown="onKeydown"
        class="border-gray-150 w-full border-b bg-transparent p-2 placeholder-gray-500 outline-0"
        placeholder="Change project..."
      />
      <div v-if="options" class="">
        <ProjectOption
          v-for="(p, idx) in options"
          :option="p"
          :check="idx === checkedIndex"
          :active="selectedProjectIdx === idx"
          @click="onClick(p.id)"
        ></ProjectOption>
      </div>
    </div>
  </teleport>
  <teleport to="body">
    <div
      v-if="open"
      @click="emit('update:open', false)"
      class="fixed inset-0"
    ></div>
  </teleport>
</template>
