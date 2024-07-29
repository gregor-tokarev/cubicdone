<script setup lang="ts">
import { useI18n } from "vue-i18n";
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
  if (props.integration.apiKeys.length) emit("disconnect");
  else emit("connect");
}

const { t } = useI18n({
  messages: {
    en: {
      connect: "Connect",
      manage: "Manage",
    },
    ru: {
      connect: "Подключить",
      manage: "Настроить",
    },
  },
});
</script>

<template>
  <div
    class="flex flex-col rounded-lg border"
    :class="{
      'border-gray-300': !integration.apiKeys.length,
      'border-black': integration.apiKeys.length,
    }"
  >
    <div class="p-5 pb-8">
      <div class="flex items-center space-x-2.5">
        <div class="flex items-center space-x-2">
          <img
            :src="integration.iconURL"
            class="!h-6 !w-6 object-contain"
            alt="icn"
          />
          <p class="text-xl capitalize">{{ integration.name }}</p>
        </div>
        <!--        <div
          v-if="integration.apiKey"
          class="flex cursor-pointer items-center space-x-1.5 rounded-lg px-1.5 py-[3px] text-gray-600 transition-colors hover:bg-gray-400 hover:text-black"
          @click="emit('link')"
        >
          <Icon name="link"></Icon>
          <span>link projects</span>
        </div>-->
      </div>
      <p class="mt-4 opacity-50">{{ integration.description }}</p>
    </div>
    <div
      class="mt-auto flex cursor-pointer select-none items-center justify-center space-x-1 border-t py-4"
      :class="{
        'border-gray-300': !integration.apiKeys.length,
        'border-black': integration.apiKeys.length,
      }"
      @click="onClickAction"
    >
      <template v-if="!integration.apiKeys.length">
        <Icon name="integrations"></Icon>
        <span>{{ t("connect") }}</span>
      </template>
      <span v-else class="text-red-400">{{ t("manage") }}</span>
    </div>
  </div>
</template>

<style scoped></style>
