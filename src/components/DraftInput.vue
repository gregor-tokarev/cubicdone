<script setup lang="ts">
import Icon from "./Icon.vue";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import {InputPart} from "../models/input-part.model.ts";
import {nanoid} from "nanoid";
import Contenteditable from "./Contenteditable.vue";

defineProps<{
  placeholder: string,
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "enter", value: void): void
}>()

const instance = getCurrentInstance()

const parts = ref<InputPart[]>([{type: "text", content: "", id: nanoid(3)}])
const partsContainer = ref<HTMLElement | null>(null)
const currentPartIdx = ref(0)

function onFocus(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  if (!target || !partsContainer.value) return

  currentPartIdx.value = Array.from(partsContainer.value.children).indexOf(target)
}

function focusOnPart(el: HTMLElement) {
  const range = document.createRange()
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    range.selectNodeContents(el);
    range.collapse(false)
    sel.addRange(range);
    el.focus()
  }
}

const projectQuery = ref("")
const openProjectSearch = ref(false)

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

      focusOnPart(nextNode)
    })
  } else if (currentPart.type === 'project' && evt.code === "Backspace") {
    setTimeout(() => {
      if (!partsContainer.value) return

      if (currentPart.content === "") {
        parts.value.splice(currentPartIdx.value, 1)

        const focusNode = partsContainer.value.children[currentPartIdx.value - 1] as HTMLElement
        focusOnPart(focusNode)

        projectQuery.value = ""
        openProjectSearch.value = false
      }
    })
  } else if (currentPart.type === 'project') {
    setTimeout(() => {
      projectQuery.value = currentPart.content.replace(/#/g, "")
    })
  }
}

const inputField = ref(null)
onMounted(() => {
  if (inputField.value) {
    const el = inputField.value as unknown as HTMLElement
    el.focus()
  }
})
</script>

<template>
  <div class="relative">
    <!--    Input box-->
    <div class="flex items-center bg-gray-400 rounded-lg px-2.5 py-1">
      <Icon name="plus" class="text-gray-350 mr-1.5"></Icon>
      <div class="flex items-center grow space-x-1" @keydown="onUpdate($event)"
           ref="partsContainer">
        <template v-for="part in parts" :key="part.id">
          <Contenteditable class="outline-0" :class="{'grow': parts.length === 1}" v-if="part.type === 'text'"
                           @focus="onFocus($event)"
                           v-model="part.content"
          >
          </Contenteditable>
          <Contenteditable class="py-[2.5px] px-[3px] rounded-lg bg-gray-450 outline-0"
                           v-else-if="part.type === 'project'"
                           v-model="part.content"
                           @focus="onFocus($event)"
          >
          </Contenteditable>
        </template>
      </div>
      <!--    <input type="text" :value="modelValue" :placeholder="placeholder"
                 ref="inputField"
                 @input="onUpdate"
                 @keyup.enter="emit('enter')"
                 class="bg-transparent placeholder-gray-350 text-base w-full border-0 outline-0">-->
    </div>
    <!--    Project select-->
    <div v-if="openProjectSearch" class="absolute bottom-0 left-0 right-0 translate-y-[calc(100%+4px)] rounded-lg bg-gray-400 py-1.5">
      <!--      Project item-->
      <div class="flex items-center py-1.5 px-2.5 space-x-1.5">
        <!--        Color circle-->
        <div class="rounded-full w-[11px] h-[11px] bg-amber-400"></div>
        <span>procollab</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
