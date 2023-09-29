<script setup lang="ts">

import DraftInput from "../components/DraftInput.vue";
import {ref} from "vue";
import {useDraftsStore} from "../store/drafts.ts";
import DraftRow from "../components/cards/DraftRow.vue";

const draftStore = useDraftsStore()

const prompt = ref("")

function onCreateDraft() {
  if (!prompt.value) return

  draftStore.create(prompt.value)

  prompt.value = ""
}

function onEditDraft(id: string, newTitle: string) {
  draftStore.edit(id, newTitle)
}
</script>

<template>
  <div class="pt-8">
    <DraftInput placeholder="todo text" v-model="prompt" @enter="onCreateDraft()"></DraftInput>
    <!--  drafts list-->
    <div class="mt-5">
      <DraftRow :draft="d" v-for="d in draftStore.sortedDrafts" :key="d.id"
                @update:title="onEditDraft(d.id, $event)"></DraftRow>
    </div>
  </div>
</template>

<style scoped>

</style>
