<script setup lang="ts">

import Icon from "../components/Icon.vue";
import {useDraftsStore} from "../store/drafts.ts";
import DraftCard from "../components/cards/DraftCard.vue";
import {computed, getCurrentInstance, onMounted} from "vue";
import {Sortable} from "@shopify/draggable"
import dayjs from "dayjs";
import {useTaskStore} from "../store/task.ts";
import TaskCard from "../components/cards/TaskCard.vue";
import {Task} from "../models/task.model.ts";

const instance = getCurrentInstance()

const draftStore = useDraftsStore()
const taskStore = useTaskStore()

const dateColumns = computed(() => {
  const count = 3
  const res = []

  for (let i = 0; i < count; i++) {
    res.push(dayjs().add(i, "day"))
  }

  return res
})

onMounted(() => {
  const sortable = new Sortable(document.querySelectorAll("[data-drag-list]"), {
    draggable: "[data-drag]",
    // mirror: {
    //   constrainDimensions: true
    // },
  })

  sortable.on("sortable:stop", onSort)
})

function onSort(evt: any) {
  const itemId = evt.data.dragEvent.originalSource.dataset.id
  if (!itemId) return

  const newDate = evt.newContainer.dataset.todo
  if ('drafts' in evt.oldContainer.dataset) {
    taskStore.commitDraft(itemId, newDate)
  } else if ('drafts' in evt.newContainer.dataset) {
    draftStore.revertFromTask(itemId)
  }
  else {
    taskStore.changeTodoDate(itemId, newDate)
  }

  // instance?.proxy?.$forceUpdate()
}

function onUpdateStatus(id: string, status: Task['status']) {
  taskStore.update(id, {status})
}
</script>

<template>
  <div class="flex flex-col py-8 h-[100vh]">
    <!--  Inbox section-->
    <div class="space-y-2.5">
      <div class="flex items-center space-x-2 text-black text-base">
        <Icon name="inbox"></Icon>
        <span>Inbox</span>
      </div>
      <div data-drag-list class="flex overflow-auto space-x-2.5 pb-2.5 min-h-[78px]" data-drafts>
        <DraftCard class="grow min-w-[25%] cursor-pointer" v-for="d in draftStore.sortedDrafts" :key="d.id"
                   :data-id="d.id"
                   data-drag
                   :draft="d"></DraftCard>
        <div v-if="!draftStore.sortedDrafts.length"
             class="flex items-center justify-center grow h-full text-sm text-gray-350">
          <span>
            You plan all your Inbox Tasks. Start working or
            <router-link tag="span" class="text-black underline" to="/inbox">create new drafts</router-link>
          </span>
        </div>
      </div>
    </div>
    <!--    Date columns-->
    <div class="flex grow space-x-5 mt-5">
      <div class="py-1.5 px-2.5 rounded-lg bg-gray-500 grow w-1/3 flex flex-col" v-for="(c, idx) in dateColumns"
           :key="idx">
        <div class="text-base text-black mb-5">
          <template v-if="idx === 0">Today,</template>
          <template v-else-if="idx === 1">Tomorrow,</template>
          {{ dayjs(c).format("DD MMM") }}
        </div>
        <div class="grow space-y-2.5" :data-todo="c" data-drag-list>
          <TaskCard v-for="t in taskStore.getByDate(c.toString())" :task="t" data-drag :data-id="t.id"
                    @update:status="onUpdateStatus(t.id, $event)"></TaskCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
