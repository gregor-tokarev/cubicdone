<script setup lang="ts">
import {Draft} from "../../models/draft.model.ts";
import dayjs from "dayjs";

defineProps<{
  draft: Draft
}>()
</script>

<template>
<div class="px-4 py-2.5 rounded-lg bg-gray-400 cursor-grab active:cursor-grabbing">
  <p class="">{{draft.title}}</p>
  <span class="text-xs text-gray-350">{{dayjs(draft.dateCreated).format("DD MMM, HH:MM")}}</span>
</div>
</template>

<style scoped>

</style>
