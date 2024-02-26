<script setup lang="ts">
import Icon from "@components/Icon.vue";
import { nanoid } from "nanoid";
import { ref } from "vue";

const props = defineProps<{
  modelValue: string; // avatar-url
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const id = nanoid(3);

// temp data-url for display newly avatar before it get uploaded to cdn
const tempImgUrl = ref("");

function onInput(evt: Event) {
  const target = evt.currentTarget as HTMLInputElement;

  const file = target.files?.item(0);
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    tempImgUrl.value = reader.result as string;
  };

  uploadImage(file);
}

async function uploadImage(_file: File) {
  let url = "";

  // do upload stuff here

  emit("update:modelValue", url);
}
</script>

<template>
  <input
    type="file"
    accept="image/*"
    :id="id"
    :disabled="disabled"
    class="absolute hidden"
    @change="onInput"
  />
  <label
    :for="id"
    class="group relative block h-[108px] w-[108px] overflow-clip rounded-full bg-gray-100"
    :class="{ 'cursor-pointer': !disabled }"
  >
    <div
      v-if="!disabled"
      class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
    >
      <Icon name="pen" class="!h-6 !w-6 text-white"></Icon>
    </div>
    <img
      v-if="tempImgUrl || modelValue"
      :src="tempImgUrl || modelValue"
      alt="user avatar"
      class="h-full w-full object-cover"
    />
  </label>
</template>

<style scoped></style>
