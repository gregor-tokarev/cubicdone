<script setup lang="ts">
import Icon from "../components/Icon.vue";

const emit = defineEmits<{
  (e: "discard", value: void): void;
  (e: "setProject", value: void): void;
  (e: "remove", value: void): void;
}>();
</script>

<template>
  <div
    class="text-gray-150 flex items-center space-x-2.5 rounded-[40px] bg-gray-900 px-[22px] py-2 text-xs"
  >
    <div
      class="flex h-[30px] cursor-pointer border border-dashed border-gray-700"
      @click="emit('discard')"
    >
      <span class="self-center px-[15px]">3 selected</span>
      <div
        class="flex w-[30px] items-center justify-center border-l border-dashed border-gray-700"
      >
        <Icon class="h-5 w-5" name="discard"></Icon>
      </div>
    </div>
    <div class="h-9 w-[1px] bg-gray-700"></div>
    <div
      @click="emit('setProject')"
      class="flex h-[30px] cursor-pointer items-center space-x-1 border border-gray-700 px-2.5"
    >
      <span>#</span>
      <span>set project</span>
    </div>
    <div
      @click="emit('remove')"
      class="flex h-[30px] cursor-pointer items-center space-x-1 border border-gray-700 px-2.5"
    >
      <Icon name="basket"></Icon>
      <span>remove</span>
    </div>
  </div>
</template>

<style scoped></style>
