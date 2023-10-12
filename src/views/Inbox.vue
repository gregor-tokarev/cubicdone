<script setup lang="ts">
import DraftInput from "../components/DraftInput.vue";
import { ref } from "vue";
import { useDraftsStore } from "../store/drafts.ts";
import DraftRow from "../components/cards/DraftRow.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { nanoid } from "nanoid";
import { InputGenericPart } from "../models/input-part.model.ts";

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
      class="mt-5"
      :list="draftStore.sortedDrafts"
      @change="onChangeOrder"
    >
      <DraftRow
        :draft="d"
        v-for="d in draftStore.sortedDrafts"
        :key="d.id"
        @update:title="onEditDraft(d.id, $event)"
      ></DraftRow>
    </VueDraggableNext>
  </div>
</template>

<style scoped></style>
