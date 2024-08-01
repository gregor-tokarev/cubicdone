<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Icon from "@components/Icon.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core/index.cjs";
import hotkeys from "hotkeys-js";
import Fuse from "fuse.js";
import SelectModal from "./SelectModals/SelectModal.vue";
import { onClickOutside, useLocalStorage } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useSyncState } from "vue-sync-client";
import { useUserStore } from "@store/user.ts";
import { i18n, trpc } from "../main.ts";
import { useI18n } from "vue-i18n";

const { t } = useI18n({
  messages: {
    ru: {
      plan: "План",
      inbox: "Входящие",
      projects: "Проекты",
      integrations: "Интеграции",
      logout: "Выйти",
      profile: "Профиль",
      syncing: "Синхронизация",

      syncNote: `Ваши {syncCount} несохраненные изменения будут загружены когда вы вернетесь в онлайн
                    <br />
                    <br />
                    <span class="text-gray-300">Кстати:</span> они перезапушут ваши изменения с других устройств
      `,

      chooseLang: "Выбрать язык",
    },
    en: {
      plan: "Plan",
      inbox: "Inbox",
      projects: "Projects",
      integrations: "Integrations",
      logout: "Logout",
      profile: "Open profile",
      syncing: "Syncing",
      syncNote: `Your {syncCount} unsaved changes will be loaded when you regain
                    connectivity
                    <br />
                    <br />
                    <span class="text-gray-300">Note:</span> it will overwrite your
                    changes from other devices

      `,

      chooseLang: "Choose language",
    },
  },
});

const navItems = ref([
  {
    title: t("plan"),
    icon: "plan",
    link: "/",
    hint: "⌘ + G",
  },
  {
    title: t("inbox"),
    icon: "inbox",
    link: "/inbox",
    hint: "⌘ + I",
  },
  {
    title: t("projects"),
    icon: "folder",
    link: "/projects",
    hint: "⌘ + P",
  },
  {
    title: t("integrations"),
    icon: "integrations",
    link: "/integrations",
  },
]);

const userStore = useUserStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const router = useRouter();

onMounted(() => {
  hotkeys("[", onBracket);

  window.addEventListener("resize", (_) => {
    compact.value = breakpoints.isSmaller("xl");
  });
});

onUnmounted(() => {
  hotkeys.unbind("[", onBracket);
});

function onBracket() {
  compact.value = !compact.value;
}

const compact = ref(breakpoints.isSmaller("xl"));

const openPanel = ref(false);
const panelEl = ref<HTMLElement | null>(null);
const userEl = ref<HTMLElement | null>(null);
onClickOutside(
  panelEl,
  () => {
    openPanel.value = false;
  },
  { ignore: [userEl] },
);

async function gotoProfile() {
  await router.push("/profile");
  openPanel.value = false;
}

function deleteCookie(name: string) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
}

async function onSignOut() {
  await trpc.auth.logout.mutate();

  deleteCookie("session");
  location.href = "https://cubicdone.com";
}

const { syncCount, networkState } = useSyncState();

const offlineBadge = ref<HTMLElement | null>(null);
const offlineBadgeBound = computed(() => {
  if (!offlineBadge.value) return;
  return offlineBadge.value.getBoundingClientRect();
});

const offlineHovered = ref(false);
function onChangeOfflineHovered(value: boolean) {
  if (!syncing.value) {
    offlineHovered.value = value;
  }
}

const syncing = computed(() => {
  return networkState.value === "online" && syncCount.value > 0;
});
const showBadge = computed(() => {
  return networkState.value === "offline" || syncing.value;
});

// locale modal
const localeQuery = ref("");
const locale = useLocalStorage("chosen_locale", i18n.global.locale.value);

const localeOptions = [
  { text: "Русский", id: "ru", icon: "🇷🇺" },
  { text: "English", id: "en", icon: "🇺🇸" },
];
const currentLocale = computed(() => {
  return localeOptions.find((l) => l.id === locale.value);
});

const localeOpen = ref(false);

const fuse = new Fuse(localeOptions, { keys: ["text", "id"] });
const filteredOptions = computed(() => {
  return localeQuery.value
    ? fuse.search(localeQuery.value).map((r) => r.item)
    : localeOptions;
});

const checkedIndex = computed(() => {
  return localeOptions.findIndex((l) => l.id === locale.value);
});

function onLocaleSelect(id: (typeof localeOptions)[0]["id"]) {
  locale.value = id;
  location.reload(); // app will take locale on boot
}
</script>

<template>
  <div
    class="flex w-[250px] flex-col rounded-br-2xl rounded-tr-2xl bg-black px-[18px] py-4"
    :class="{ '!w-[60px] !px-[13px]': compact }"
  >
    <!--    title block-->
    <div class="relative flex h-[38px] items-center justify-between">
      <div
        class="flex items-center space-x-1.5"
        :class="{
          'max-w-[85%]': !compact,
          'w-full': compact,
        }"
      >
        <div
          v-if="userStore.user"
          ref="userEl"
          @click="openPanel = !openPanel"
          class="!hover:text-white flex max-w-full cursor-pointer items-center from-[#1A1A1A] to-[#141414] transition-colors hover:bg-gradient-to-r"
          :class="{
            'space-x-2 px-[1px] py-0.5': !compact,
          }"
        >
          <img
            :src="userStore.user?.avatar ?? ''"
            :alt="userStore?.user?.firstName ?? 'profile image'"
            class="!min-h-[34px] !w-[34px] !min-w-[34px] shrink-0 overflow-hidden rounded-full"
          />
          <p
            v-if="!compact && !showBadge"
            class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-200"
          >
            {{ userStore.user.firstName }} {{ userStore.user.lastName }}
          </p>
        </div>
        <div
          ref="offlineBadge"
          v-if="!compact && showBadge"
          class="flex items-center space-x-1.5 rounded-md bg-gray-900 px-2 py-1.5 text-[12px] text-gray-500"
          @mouseenter="onChangeOfflineHovered(true)"
          @mouseleave="onChangeOfflineHovered(false)"
        >
          <template v-if="!syncing">
            <Icon name="offline"></Icon>
            <span>offline {{ syncCount }}</span>
          </template>
          <template v-else>
            <Icon name="sync" class="animate-spin text-gray-300"></Icon>
            <span class="text-gray-300">{{ t("syncing") }}...</span>
          </template>
        </div>
      </div>
      <!-- <Icon
        v-if="!compact"
        v-hint="'['"
        name="sidebar-left"
        class="cursor-pointer text-gray-200"
        @click="compact = !compact"
      >
      </Icon> -->
      <div
        ref="panelEl"
        class="absolute bottom-0 left-0 z-10 w-[200px] translate-y-[calc(100%+4px)] space-y-2 rounded-md border border-gray-900 bg-gradient-to-r from-[#1A1A1A] to-[#141414] px-2 py-1.5"
        v-if="openPanel"
      >
        <button
          @click="gotoProfile"
          class="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-[14px] text-gray-200 transition-colors hover:bg-black hover:text-gray-50"
        >
          <span class="">{{ t("profile") }}</span>
          <span>⌘ + O</span>
        </button>
        <button
          @click="onSignOut"
          class="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-[14px] text-red-400 transition-colors hover:bg-black"
        >
          <span class="">{{ t("logout") }}</span>
          <Icon name="exit" class="!h-4 !w-4"></Icon>
        </button>
      </div>
    </div>
    <div
      v-if="compact && showBadge"
      ref="offlineBadge"
      @mouseenter="onChangeOfflineHovered(true)"
      @mouseleave="onChangeOfflineHovered(false)"
      class="mt-3 flex h-[32px] w-[32px] items-center justify-center rounded bg-gray-900 text-gray-500"
    >
      <Icon v-if="!syncing" name="offline"></Icon>
      <Icon v-else name="sync" class="animate-spin text-gray-300"></Icon>
    </div>
    <!--  navigation block-->
    <nav class="mt-6 space-y-1.5">
      <router-link
        class="flex cursor-pointer items-center space-x-2 rounded px-1.5 py-1 text-base text-gray-200"
        :class="{
          'h-unset w-full': !compact,
          'h-[32px] w-[32px] justify-center': compact,
        }"
        v-for="item in navItems"
        :to="item.link"
        v-hint="item.hint"
        :aria-label="item.title"
        exact-active-class="!text-white bg-gradient-to-r from-[#1A1A1A] to-[#141414]"
      >
        <Icon :size="18" :name="item.icon"></Icon>
        <span v-if="!compact">{{ item.title }}</span>
      </router-link>
    </nav>
    <div
      class="mt-auto flex h-[32px] cursor-pointer items-center space-x-2 rounded from-[#1A1A1A] to-[#141414] px-1.5 py-2 text-base text-gray-200 transition-colors hover:bg-gradient-to-r hover:text-white"
      :class="{
        'h-unset w-full': !compact,
        'w-[32px] justify-center': compact,
      }"
      @click="localeOpen = !localeOpen"
    >
      <span>{{ currentLocale?.icon }}</span>
      <span v-if="!compact">{{ currentLocale?.text }}</span>
    </div>
    <teleport to="body">
      <div
        class="absolute pt-1"
        @mouseenter="offlineHovered = true"
        @mouseleave="offlineHovered = false"
        v-if="offlineBadgeBound && offlineHovered"
        :style="{
          top: `${offlineBadgeBound.top + offlineBadgeBound.height}px`,
          left: `${offlineBadgeBound.left}px`,
        }"
      >
        <p
          class="w-[215px] rounded-md bg-gray-900 px-2.5 pb-4 pt-2 text-[12px] text-gray-500"
          v-html="t('syncNote', { syncCount: syncCount })"
        ></p>
      </div>
    </teleport>
    <SelectModal
      v-if="filteredOptions"
      :hint-text="t('chooseLang')"
      :checked-index="checkedIndex"
      :options="filteredOptions"
      v-model:open="localeOpen"
      v-model:query="localeQuery"
      @submit="onLocaleSelect"
    >
    </SelectModal>
  </div>
</template>

<style scoped></style>
