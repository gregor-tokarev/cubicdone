<script setup lang="ts">
import { ApiKey } from "contract-models";
import { useI18n } from "vue-i18n";

defineProps<{
  apiKey: ApiKey;
}>();

const emit = defineEmits<{
  (e: "revoke", value: void): void;
}>();

const { t } = useI18n({
  messages: {
    en: {
      revoke: "Revoke",
    },
    ru: {
      revoke: "Отозвать",
    },
  },
});
</script>

<template>
  <div
    class="flex items-center justify-between rounded bg-gray-100 px-2 py-1 text-black"
  >
    <span>{{ apiKey.label }}</span>
    <button
      class="border-gray-150 rounded border px-2 py-[3px] text-xs"
      @click="emit('revoke')"
    >
      {{ t("revoke") }}
    </button>
  </div>
</template>

<style scoped></style>
