<script setup lang="ts">
import Icon from "./Icon.vue";
import {ref, watch} from "vue";
import {InputPart} from "../models/input-part.model.ts";
import {nanoid} from "nanoid";
import Contenteditable from "./Contenteditable.vue";
import {useProjectStore} from "../store/project.model.ts";
import {Project} from "../models/project.model.ts";
import Fuse from "fuse.js";
import FuseResult = Fuse.FuseResult;
import {focusOnEditableElement} from "../utils/focus.ts";

defineProps<{
  placeholder: string,
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "enter", value: void): void
}>()

const projectStore = useProjectStore()

const parts = ref<InputPart[]>([{type: "text", content: "", id: nanoid(3)}])
const partsContainer = ref<HTMLElement | null>(null)
const currentPartIdx = ref(0)

function onFocus(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  if (!target || !partsContainer.value) return

  currentPartIdx.value = Array.from(partsContainer.value.children).indexOf(target)
}



watch(currentPartIdx, newValue => {
  const part = parts.value[newValue]
  if (part.type === 'project') openProjectSearch.value = true
})

function onUpdate(event: Event) {
  const evt = event as KeyboardEvent

  const target = evt.target as HTMLElement
  if (!target) return

  const currentPart = parts.value[currentPartIdx.value];

  if (evt.key === '#' && currentPart.type === 'text') {
    event.preventDefault();

    const projectPart = {type: 'project', projectId: null, id: nanoid(3), content: "#"}
    parts.value.splice(currentPartIdx.value + 1, 0, projectPart)

    setTimeout(() => {
      if (!partsContainer.value) return
      const nextNode = partsContainer.value.children[currentPartIdx.value + 1] as HTMLElement

      focusOnEditableElement(nextNode)
    })
  } else if (evt.code === "Backspace" && currentPart.type === 'text') {
    setTimeout(() => {
      if (!partsContainer.value || currentPartIdx.value === 0) return

      if (currentPart.content === "") {
        parts.value.splice(currentPartIdx.value, 1)

        const focusNode = partsContainer.value.children[currentPartIdx.value - 1] as HTMLElement
        focusOnEditableElement(focusNode)
      }
    })
  } else if (currentPart.type === 'project') {
    handleProject(evt)
  }
}

const projectQuery = ref("")
const projectQueryResult = ref<FuseResult<Project>[]>([])
const openProjectSearch = ref(false)

const projectOptionSelected = ref(0)
watch(projectQuery, newValue => {
  const searchIndex = projectStore.getIndex

  projectQueryResult.value = searchIndex.search(newValue)
})

function handleProject(evt: KeyboardEvent) {
  const currentPart = parts.value[currentPartIdx.value];

  setTimeout(() => {
    if (evt.code !== "ArrowUp" && evt.code !== "ArrowDown")
    projectQuery.value = currentPart.content.replace(/#/g, "")
  })

  if (evt.code === "Backspace") {
    setTimeout(() => {
      if (!partsContainer.value) return

      if (currentPart.content === "") {
        parts.value.splice(currentPartIdx.value, 1)

        const focusNode = partsContainer.value.children[currentPartIdx.value - 1] as HTMLElement
        focusOnEditableElement(focusNode)

        projectQuery.value = ""
        openProjectSearch.value = false
      }
    })
  } else if (evt.code === "Enter") {
    evt.preventDefault()

    if (projectOptionSelected.value === projectQueryResult.value.length) {
      projectStore.create(projectQuery.value)
    } else {
      parts.value[currentPartIdx.value].projectId = projectQueryResult.value[projectOptionSelected.value].item.id
    }

    openProjectSearch.value = false
    projectQuery.value = ""

    const textPart = {id: nanoid(3), content: "", type: "text"}
    parts.value.push(textPart)

    setTimeout(() => {
      parts.value.forEach((p, idx) => {
        if (p.type === "project" && p.id !== parts.value[currentPartIdx.value].id) {
          parts.value.splice(idx, 1, {...p, type: "text", projectId: undefined})
        }
      })

      if (!partsContainer.value) return
      const focusElement = partsContainer.value.children[currentPartIdx.value + 1] as HTMLElement
      focusOnEditableElement(focusElement)


    })
  } else if (evt.code === "ArrowUp" || evt.code === "ArrowDown") {
    evt.preventDefault();

    if (evt.code === "ArrowUp") {
      if (projectOptionSelected.value < 1) {
        projectOptionSelected.value = projectQueryResult.value.length
      } else {
        projectOptionSelected.value--
      }
    } else if (evt.code === "ArrowDown") {
      if (projectOptionSelected.value > projectQueryResult.value.length - 1) {
        projectOptionSelected.value = 0
      } else {
        projectOptionSelected.value++
      }
    }

    parts.value[currentPartIdx.value].content = "#" + projectQueryResult.value[projectOptionSelected.value].item.title
  }
}
</script>

<template>
  <div class="relative">
    <!--    Input box-->
    <div class="flex items-center bg-gray-400 rounded-lg px-2.5 py-1">
      <Icon name="plus" class="text-gray-350 mr-1.5"></Icon>
      <div class="flex items-center grow space-x-1" @keydown="onUpdate($event)"
           ref="partsContainer">
        <template v-for="part in parts" :key="part.id">
          <Contenteditable class="outline-0" tag="p" :class="{'grow': parts.length === 1}" v-if="part.type === 'text'"
                           @focus="onFocus($event)"
                           v-model="part.content"
          >
          </Contenteditable>
          <Contenteditable class="py-[2.5px] px-[3px] rounded-lg bg-gray-450 outline-0"
                           :class="{
                            [`!bg-${projectStore.getOne(part.projectId)?.color}-100`]: part.projectId,
                            [`!text-${projectStore.getOne(part.projectId)?.color}-400`]: part.projectId
                          }"
                           tag="p"
                           v-else-if="part.type === 'project'"
                           v-model="part.content"
                           @focus="onFocus($event)"
          >
          </Contenteditable>
        </template>
      </div>
    </div>
    <!--    Project select-->
    <div v-if="openProjectSearch"
         class="absolute bottom-0 left-0 right-0 translate-y-[calc(100%+4px)] rounded-lg bg-gray-400 py-1.5">
      <!--      Project item-->
      <template v-if="projectQueryResult">
        <div v-for="(p, idx) in projectQueryResult"
             class="flex items-center py-1.5 px-2.5 space-x-1.5"
             :class="{'bg-gray-450': projectOptionSelected === idx}"
        >
          <!--        Color circle-->
          <div class="rounded-full w-[11px] h-[11px] bg-amber-400" :class="{[`bg-${p.item.color}-400`]: true}"></div>
          <span>{{ p.item.title }}</span>
        </div>
      </template>
      <div
          class="flex items-center py-1.5 px-2.5 space-x-1.5"
          :class="{'bg-gray-450': projectOptionSelected === projectQueryResult.length}"
      >
        Create Project "{{ projectQuery }}"
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
