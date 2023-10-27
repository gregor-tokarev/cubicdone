<script setup lang="ts">
import Icon from "./Icon.vue";

const emit = defineEmits<{
  (e: "cancel", value: void): void;
}>();
</script>

<template>
  <div class="fixed inset-0">
    <div
      class="absolute inset-0 bg-black opacity-50"
      @click="emit('cancel')"
    ></div>
    <div
      class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6"
    >
      <Icon
        class="absolute right-2 top-2 cursor-pointer"
        name="cancel"
        @click="emit('cancel')"
      ></Icon>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped></style>
