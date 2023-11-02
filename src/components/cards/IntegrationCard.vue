<script setup lang="ts">
import Icon from "../Icon.vue";
import { Integration } from "@models/integration.model.ts";

const props = defineProps<{
  integration: Integration;
}>();

const emit = defineEmits<{
  (e: "connect", value: void): void;
  (e: "disconnect", value: void): void;
  (e: "link", value: void): void;
}>();

function onClickAction() {
  if (props.integration.apiKey) emit("disconnect");
  else emit("connect");
}
</script>

<template>
  <div
    class="rounded-lg border"
    :class="{
      'border-gray-150': !integration.apiKey,
      'border-black': integration.apiKey,
    }"
  >
    <div class="p-5 pb-8">
      <div class="flex items-center space-x-2.5">
        <div class="flex items-center space-x-2">
          <img :src="integration.iconURL" alt="icn" />
          <p class="text-xl capitalize">{{ integration.name }}</p>
        </div>
        <!--        <div
          v-if="integration.apiKey"
          class="flex cursor-pointer items-center space-x-1.5 rounded-lg px-1.5 py-[3px] text-gray-350 transition-colors hover:bg-gray-400 hover:text-black"
          @click="emit('link')"
        >
          <Icon name="link"></Icon>
          <span>link projects</span>
        </div>-->
      </div>
      <p class="mt-4 opacity-50">{{ integration.description }}</p>
    </div>
    <div
      class="flex cursor-pointer select-none items-center justify-center space-x-1 border-t py-4"
      :class="{
        'border-gray-150': !integration.apiKey,
        'border-black': integration.apiKey,
      }"
      @click="onClickAction"
    >
      <template v-if="!integration.apiKey">
        <Icon name="integrations"></Icon>
        <span>Connect</span>
      </template>
      <span v-else class="text-red-400">Disconnect</span>
    </div>
  </div>
</template>

<style scoped></style>
