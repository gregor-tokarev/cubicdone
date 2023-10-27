<script setup lang="ts">
import Icon from "../Icon.vue";
import { computed, onMounted, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useEventListener } from "@vueuse/core/index";
import Fuse from "fuse.js";

const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string; id: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const root = ref<HTMLElement | null>(null);

const open = ref(false);

const selectEl = ref<HTMLElement | null>(null);
const selectBound = computed(() => {
  if (!selectEl.value) return;

  return selectEl.value.getBoundingClientRect();
});

const optionsEl = ref<HTMLElement | null>(null);
onClickOutside(optionsEl, () => {
  open.value = false;
});

function onToggle() {
  if (!open.value) {
    filterQ.value = "";
  }
  open.value = !open.value;
}

const filterQ = ref("");
onMounted(() => {
  useEventListener(document, "keydown", (e) => {
    if (e.key === "Backspace") filterQ.value = filterQ.value.slice(0, -1);
    else filterQ.value += e.key;
  });
});

const filteredOptions = computed(() => {
  const fuse = new Fuse(props.options, { keys: ["label", "value"] });

  const search = fuse.search(filterQ.value);
  return filterQ.value ? search.map((r) => r.item) : props.options;
});
</script>

<template>
  <div class="" ref="root">
    <div
      ref="selectEl"
      class="flex min-h-[32px] cursor-pointer items-center justify-between rounded-lg bg-gray-400 px-3 py-1"
      @click="onToggle()"
    >
      <span>{{ modelValue }}</span>
      <Icon
        name="arrow"
        class="h-6 w-6 rotate-180 transition-transform"
        :class="{ '!rotate-0': open }"
      ></Icon>
    </div>
    <teleport to="body">
      <div
        ref="optionsEl"
        v-if="selectBound && open"
        class="fixed z-10 cursor-pointer rounded-lg bg-gray-400 py-1.5 shadow-lg"
        :style="{
          top: `${selectBound.top + selectBound.height + 8}px`,
          left: `${selectBound.left}px`,
          width: `${selectBound.width}px`,
        }"
      >
        <div
          class="px-2.5 py-1.5 transition-colors hover:bg-gray-450"
          @click="emit('update:modelValue', op.value)"
          v-for="op in filteredOptions"
          :key="op.id"
        >
          {{ op.label }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped></style>
