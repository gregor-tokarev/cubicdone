<script setup lang="ts">
import { useUserStore } from "@store/user.ts";
import * as cookie from "cookie";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const { t } = useI18n({
  messages: {
    en: {
      onlyDesktop: "Sorry but we only support desktop devices for now",
    },
    ru: {
      onlyDesktop: "Извините, но пока мы поддерживаем только компьютеры",
    },
  },
});

const isMobile = computed(() => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
});
onMounted(async () => {
  if (isMobile.value) return;

  const c = cookie.parse(document.cookie);
  const session = c["session"];

  if (!session) {
    return router.replace("/auth");
  }

  if (location.pathname.includes("/auth")) return;

  try {
    await userStore.fetchUser();
  } catch {
    console.log("Error");
    return router.replace("/auth");
  }
});

router.onError((error, to) => {
  if (
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed")
  ) {
    location.href = to.fullPath;
  }
});
</script>

<template>
  <router-view v-if="!isMobile"></router-view>
  <div v-else class="fixed inset-0 flex">
    <div class="m-auto space-y-4 px-10 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="size-10 mx-auto text-gray-700"
      >
        <path
          d="M4 16H20V5H4V16ZM13 18V20H17V22H7V20H11V18H2.9918C2.44405 18 2 17.5511 2 16.9925V4.00748C2 3.45107 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44892 22 4.00748V16.9925C22 17.5489 21.5447 18 21.0082 18H13Z"
        ></path>
      </svg>
      <p class="text-[20px] text-gray-700">{{ t("onlyDesktop") }}</p>
    </div>
  </div>
</template>

<style scoped></style>
