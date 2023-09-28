<script setup lang="ts">

import DraftInput from "../components/DraftInput.vue";
import {ref} from "vue";
import {useDraftsStore} from "../store/drafts.ts";
import DraftRow from "../components/cards/DraftRow.vue";

const draftStore = useDraftsStore()

const prompt = ref("")

function onCreateDraft() {
  draftStore.create(prompt.value)
}
</script>

<template>
  <div class="">
    <DraftInput placeholder="todo text" v-model="prompt" @enter="onCreateDraft()"></DraftInput>
    <!--  drafts list-->
    <div class="mt-5">
      <DraftRow :draft="d" v-for="d in draftStore.sortedDrafts"></DraftRow>
    </div>
  </div>
</template>

<style scoped>

</style>
