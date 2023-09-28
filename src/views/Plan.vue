<script setup lang="ts">

import Icon from "../components/Icon.vue";
import {useDraftsStore} from "../store/drafts.ts";
import DraftCard from "../components/cards/DraftCard.vue";

const draftStore = useDraftsStore()
</script>

<template>
  <div class="">
    <!--  Inbox section-->
    <div class="space-y-2.5">
      <div class="flex items-center space-x-2 text-black text-base">
        <Icon name="inbox"></Icon>
        <span>Inbox</span>
      </div>
      <div class="flex overflow-auto space-x-2.5 pb-2.5">
        <DraftCard class="grow min-w-[25%] cursor-pointer" v-for="d in draftStore.sortedDrafts" :key="d.id"
                   :draft="d"></DraftCard>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
