<script setup lang="ts">
import DraftInput from "@components/DraftInput.vue";
import { ref, watch } from "vue";
import { useDraftsStore } from "@store/drafts.ts";
import DraftRow from "@components/cards/DraftRow.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { nanoid } from "nanoid";
import { InputGenericPart } from "@models/input-part.model.ts";
import ContextMenu from "@components/ContextMenu.vue";
import { onClickOutside } from "@vueuse/core";
import { setScrolling } from "@utils/setScrolling.ts";
import * as wasi from "wasi";

const draftStore = useDraftsStore();

const prompt = ref<InputGenericPart[]>([
  { type: "text", content: "", id: nanoid(3) },
]);

function onCreateDraft() {
  if (!prompt.value) return;

  const text = prompt.value.reduce((acc, p) => {
    if (p.type === "text") {
      acc += p.content;
    }

    return acc;
  }, "");

  const projectPart = prompt.value.find((p) => p.type === "project");

  draftStore.create(
    text,
    projectPart && "projectId" in projectPart ? projectPart?.projectId : null,
  );
}

function onEditDraft(id: string, newTitle: string) {
  draftStore.edit(id, newTitle);
}

function onChangeOrder(evt: any) {
  if (evt["moved"]) {
    const item = evt["moved"].element;
    const oldIdx = evt["moved"].oldIndex;
    const newIdx = evt["moved"].newIndex;

    draftStore.changeOrder(item.id, oldIdx, newIdx);
  }
}

const contextMenuOpen = ref(false);
watch(contextMenuOpen, (value) => {
  if (!value) {
    hoveredDraftId.value = null;
    setScrolling(true);
  }
});
const contextMenuEl = ref<ContextMenu | null>(null);
const listEl = ref<HTMLElement | null>(null);

function onToggleContextMenu(evt: MouseEvent) {
  clickX.value = evt.clientX;
  clickY.value = evt.clientY;

  contextMenuOpen.value = true;
  setScrolling(false);
}

const clickX = ref(0);
const clickY = ref(0);

// const selectedDraftIds = ref<string[]>([]);
const hoveredDraftId = ref<string | null>(null);

function onSelectContextMenu(action: string) {
  if (action === "del") {
    hoveredDraftId.value && draftStore.remove(hoveredDraftId.value);
    contextMenuOpen.value = false;
  }
}

function onListLeave() {
  if (!contextMenuOpen.value) {
    hoveredDraftId.value = null;
  }
}
</script>

<template>
  <div class="pt-8">
    <DraftInput
      placeholder="todo text"
      v-model="prompt"
      @enter="onCreateDraft()"
    ></DraftInput>
    <!--  drafts list-->
    <VueDraggableNext
      ref="listEl"
      class="mt-5"
      :list="draftStore.sortedDrafts"
      @change="onChangeOrder"
      @mouseleave="onListLeave"
      @contextmenu.prevent="onToggleContextMenu"
    >
      <DraftRow
        :draft="d"
        v-for="d in draftStore.sortedDrafts"
        :key="d.id"
        :class="{ 'bg-gray-50': hoveredDraftId === d.id }"
        @mouseenter="hoveredDraftId = d.id"
        @update:title="onEditDraft(d.id, $event)"
      ></DraftRow>
    </VueDraggableNext>
  </div>
  <teleport to="body">
    <ContextMenu
      ref="contextMenuEl"
      v-model:show="contextMenuOpen"
      :options="[{ id: nanoid(3), label: 'Delete', kbd: '⌘ ⌫', value: 'del' }]"
      class="absolute"
      :style="{
        top: `${clickY}px`,
        left: `${clickX}px`,
      }"
      @option="onSelectContextMenu($event)"
    ></ContextMenu>
  </teleport>
</template>

<style scoped></style>
