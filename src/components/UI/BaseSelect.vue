<script setup lang="ts">
import Icon from "../Icon.vue";
import { computed, onMounted, ref } from "vue";
import { useEventListener, onClickOutside } from "@vueuse/core";
import Fuse from "fuse.js";

const props = defineProps<{
  modelValue: string | null;
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

const selectedOption = computed(() => {
  return filteredOptions.value.find((op) => op.value === props.modelValue);
});

const optionIdx = ref(-1);
const filterQ = ref("");
onMounted(() => {
  useEventListener(document, "keydown", (e) => {
    if (!open.value) return;

    if (e.key === "Backspace") filterQ.value = filterQ.value.slice(0, -1);
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();

      if (e.key === "ArrowUp") {
        optionIdx.value =
          optionIdx.value === 0
            ? filteredOptions.value.length - 1
            : optionIdx.value - 1;
      } else if (e.key === "ArrowDown") {
        optionIdx.value =
          optionIdx.value === filteredOptions.value.length - 1
            ? 0
            : optionIdx.value + 1;
      }
    } else if (e.key === "Enter") {
      onEmit(filteredOptions.value[optionIdx.value].id);
    } else {
      filterQ.value += e.key;
      optionIdx.value = 0;
    }
  });
});

function onEmit(opId: string) {
  const op = filteredOptions.value.find((o) => o.id === opId);
  op && emit("update:modelValue", op?.value);

  open.value = false;
}

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
      <span>{{
        selectedOption !== undefined ? selectedOption.label : ""
      }}</span>
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
          :class="{ 'bg-gray-450': idx === optionIdx }"
          @click="onEmit(op.id)"
          v-for="(op, idx) in filteredOptions"
          :key="op.id"
        >
          {{ op.label }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped></style>
