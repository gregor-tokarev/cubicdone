<script setup lang="ts">
import BaseButton from "@components/UI/BaseButton.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({
  messages: {
    en: {
      message: "Profile Changed",
      updating: "Updating...",
      saveButton: "Save",
    },
    ru: {
      message: "Профиль изменен",
      updating: "Обновляется...",
      saveButton: "Сохранить",
    },
  },
});

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "save", value: void): void;
}>();
</script>

<template>
  <div
    class="flex translate-y-full items-center justify-between rounded-md bg-black px-4 py-2 text-white"
  >
    <span>{{ loading ? t("updating") : t("message") }}</span>
    <BaseButton :loading="loading" @click="emit('save')">{{
      t("saveButton")
    }}</BaseButton>
  </div>
</template>

<style scoped></style>
