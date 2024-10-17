<script setup lang="ts">
import AuthButton from "@components/UI/AuthButton.vue";
import { ref } from "vue";
import Icon from "../../components/Icon.vue";
import { useI18n } from "vue-i18n";

const opening = ref(false);
const { t } = useI18n({
  messages: {
    en: {
      title: "Signin into cubicdone",
      buttonText: "Continue with {provider}",
    },
    ru: {
      title: "Вход в cubicdone",
      buttonText: "Продолжить с {provider}",
    },
  },
});

async function onSignin(strategy: "google" | "linear" | "github") {
  opening.value = true;
  const host = import.meta.env.PROD
    ? "https://api.cubicdone.com"
    : "http://localhost:4000";
  location.href = `${host}/oauth/${strategy}`;
}
</script>

<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <h1 class="mb-[30px] text-center text-[32px] text-gray-800">
      {{ t("title") }}
    </h1>
    <div class="space-y-4">
      <AuthButton @click="onSignin('google')" :disabled="opening">
        <Icon
          v-if="opening"
          name="sync"
          class="animate-spin text-gray-800"
        ></Icon>
        <Icon v-else :size="24" name="google"></Icon>
        <span>{{ t("buttonText", { provider: "google" }) }}</span>
      </AuthButton>
      <AuthButton @click="onSignin('linear')" :disabled="opening">
        <Icon
          v-if="opening"
          name="sync"
          class="animate-spin text-gray-800"
        ></Icon>
        <Icon v-else :size="24" name="linear"></Icon>
        <span>{{ t("buttonText", { provider: "linear" }) }}</span>
      </AuthButton>
      <AuthButton @click="onSignin('github')" :disabled="opening">
        <Icon
          v-if="opening"
          name="sync"
          class="animate-spin text-gray-800"
        ></Icon>
        <Icon v-else :size="24" name="github"></Icon>
        <span>{{ t("buttonText", { provider: "github" }) }}</span>
      </AuthButton>
    </div>
  </div>
</template>
