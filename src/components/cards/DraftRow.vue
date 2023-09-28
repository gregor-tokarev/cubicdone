<script setup lang="ts">
import {Draft} from "../../models/draft.model.ts";
import * as dayjs from "dayjs";

defineProps<{
  draft: Draft
}>()

const emit = defineEmits<{
  (e: "update:title", value: string): void
}>()

function onEditDraft(event: Event) {
  const target = event.currentTarget as HTMLElement
  const value = target.textContent

  value && emit("update:title", value)
}
</script>

<template>
  <div class="flex items-baseline p-2.5 border-b border-gray-400">
    <!--    Title-->
    <div contenteditable="true" @input="onEditDraft($event)" class="text-base text-black outline-0">{{draft.title}}</div>
    <div class="ml-2.5 text-xs text-gray-300">{{dayjs(draft.dateCreated).format("D MMM, HH:mm")}}</div>
  </div>
</template>

<style scoped>

</style>
