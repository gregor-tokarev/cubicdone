<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder: string;
    type: string;
    error: boolean;
    autocomplete: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    type: "text",
    autocomplete: false,
    error: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "blur", value: void): void;
  (e: "enter", value: void): void;
}>();

function onInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div
    class="rounded-lg border border-transparent bg-gray-100 px-2 py-1.5"
    :class="{ '!border-red-400': error }"
  >
    <input
      :type="type"
      class="w-full border-0 bg-transparent placeholder-gray-500 outline-0"
      :value="modelValue"
      :autocomplete="autocomplete ? 'on' : 'off'"
      :placeholder="placeholder"
      @input="onInput"
      @blur="emit('blur')"
      @keyup.enter="emit('enter')"
    />
  </div>
</template>

<style scoped></style>
