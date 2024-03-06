<script setup lang="ts">
import DraftInput from "@components/DraftInput.vue";
import { onMounted, ref, watch } from "vue";
import { useDraftsStore } from "@store/drafts.ts";
import DraftRow from "@components/cards/DraftRow.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { nanoid } from "nanoid";
import { InputGenericPart } from "@models/input-part.model.ts";
import ContextMenu from "@components/ContextMenu.vue";
import { setScrolling } from "@utils/setScrolling.ts";
import hotkeys from "hotkeys-js";
import { useProjectModalStore } from "@store/project-modal.ts";
import InboxCommand from "@components/InboxCommand.vue";
import { useDeleteModalStore } from "@store/delete-modal.ts";
import { animate } from "motion";

const draftStore = useDraftsStore();

const prompt = ref<InputGenericPart[]>([
  { type: "text", content: "", id: nanoid(3) },
]);

onMounted(async () => {
  await draftStore.loadDrafts();

  hotkeys("cmd+backspace", () => {
    removeDraft();
  });
  hotkeys("shift+p", () => {
    selectProject();
  });
  hotkeys("x,shift+x", () => {
    hoveredDraftId.value && onUpdateSelect(hoveredDraftId.value);
  });
  hotkeys("esc", () => {
    if (selectedDraftIds.value.length) {
      selectedDraftIds.value = [];
    }
  });
});

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

const inboxCommandEl = ref<InstanceType<typeof InboxCommand> | null>(null);
const selectedDraftIds = ref<string[]>([]);
watch(
  selectedDraftIds,
  (ids) => {
    if (!inboxCommandEl.value) return;

    if (ids.length > 0) {
      animate(inboxCommandEl.value.$el, {
        transform: "translateY(-50%) translateX(-50%)",
      });
    } else {
      animate(inboxCommandEl.value.$el, {
        transform: "translateY(100%) translateX(-50%)",
      });
    }
  },
  { deep: true },
);

function onUpdateSelect(draftId: string) {
  if (hotkeys.isPressed("shift") && selectedDraftIds.value.length > 0) {
    const draft = draftStore.getOne(draftId);
    if (!draft) return;

    const selectedDrafts = selectedDraftIds.value.map(
      (d) => draftStore.getOne(d)!,
    );
    const selectedOrders = selectedDrafts.map((d) => d.order);

    const minSelectedOrder = Math.min(...selectedOrders);
    const maxSelectedOrder = Math.max(...selectedOrders);

    if (draft.order > maxSelectedOrder) {
      const draftsToAdd = draftStore.drafts.filter(
        (d) => d.order < draft.order && d.order > maxSelectedOrder,
      );

      selectedDraftIds.value = selectedDraftIds.value.concat(
        draftsToAdd.map((d) => d.id),
      );
    } else if (draft.order < minSelectedOrder) {
      const draftsToAdd = draftStore.drafts.filter(
        (d) => d.order > draft.order && d.order < minSelectedOrder,
      );

      selectedDraftIds.value = selectedDraftIds.value.concat(
        draftsToAdd.map((d) => d.id),
      );
    }
  }

  if (selectedDraftIds.value.includes(draftId)) {
    const idx = selectedDraftIds.value.findIndex((did) => did === draftId);
    selectedDraftIds.value.splice(idx, 1);
  } else {
    selectedDraftIds.value.push(draftId);
  }
}

const contextMenuOpen = ref(false);
watch(contextMenuOpen, (value) => {
  if (!value) {
    hoveredDraftId.value = null;
    setScrolling(true);
  }
});
const contextMenuEl = ref<HTMLElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

function onToggleContextMenu(evt: MouseEvent) {
  clickX.value = evt.clientX;
  clickY.value = evt.clientY;

  contextMenuOpen.value = true;
  setScrolling(false);
}

const clickX = ref(0);
const clickY = ref(0);

const hoveredDraftId = ref<string | null>(null);

const projectModalStore = useProjectModalStore();
async function onSelectContextMenu(action: string) {
  if (action === "del") {
    removeDraft();
    contextMenuOpen.value = false;
  } else if (action === "proj") {
    selectProject();
    contextMenuOpen.value = false;
  }
}

const deleteModalStore = useDeleteModalStore();
async function removeDraft() {
  if (selectedDraftIds.value.length) {
    const res = await deleteModalStore.use({
      titleText: `Are you sure you want to delete ${selectedDraftIds.value.length} drafts?`,
      descriptionText:
        "Delete would be permanent, you can’t restore issues later.",
    });
    if (!res) return;

    draftStore.remove(selectedDraftIds.value);
    selectedDraftIds.value = [];

    return;
  }

  const draft = hoveredDraftId.value
    ? draftStore.getOne(hoveredDraftId.value)
    : null;
  if (!draft) return;

  const res = await deleteModalStore.use({
    titleText: `Are you sure you want to delete “${draft.title}”?`,
    descriptionText:
      "Delete would be permanent, you can’t restore issues later.",
  });

  res && draftStore.remove(draft.id);
}

function selectProject() {
  if (selectedDraftIds.value.length > 0) {
    projectModalStore
      .use({
        hintText: `${selectedDraftIds.value.length} drafts`,
      })
      .then((projectId) => {
        draftStore.setProject(selectedDraftIds.value, projectId);

        selectedDraftIds.value = [];
      });

    return;
  }

  if (!hoveredDraftId.value) return;
  const draft = draftStore.getOne(hoveredDraftId.value);
  if (!draft) return;

  projectModalStore
    .use({
      draft,
      hintText: draft.title,
    })
    .then((projectId) => {
      draftStore.setProject(draft.id, projectId);
    });
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
        v-for="(d, idx) in draftStore.sortedDrafts"
        :key="idx"
        :class="{ 'bg-gray-50': hoveredDraftId === d.id }"
        :selected="selectedDraftIds.includes(d.id)"
        @mouseenter="hoveredDraftId = d.id"
        @update:title="onEditDraft(d.id, $event)"
        @update:selected="onUpdateSelect(d.id)"
      ></DraftRow>
    </VueDraggableNext>
  </div>
  <teleport to="body">
    <ContextMenu
      ref="contextMenuEl"
      v-model:show="contextMenuOpen"
      :options="[
        { id: nanoid(3), label: 'Delete', kbd: '⌘ ⌫', value: 'del' },
        { id: nanoid(3), label: 'Project', kbd: '⇧ P', value: 'proj' },
      ]"
      class="absolute"
      :style="{
        top: `${clickY}px`,
        left: `${clickX}px`,
      }"
      @option="onSelectContextMenu($event)"
    ></ContextMenu>
  </teleport>
  <InboxCommand
    ref="inboxCommandEl"
    class="fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
    @discard="selectedDraftIds = []"
    @setProject="selectProject"
    @remove="removeDraft"
  ></InboxCommand>
</template>

<style scoped></style>
