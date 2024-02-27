<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core/index.cjs";
import hotkeys from "hotkeys-js";
import { onClickOutside } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useClerk, useSession, useUser } from "vue-clerk";

const navItems = ref([
  {
    title: "Plan",
    icon: "sidebar/plan",
    link: "/",
    hint: "⌘ + G",
  },
  {
    title: "Inbox",
    icon: "sidebar/inbox",
    link: "/inbox",
    hint: "⌘ + I",
  },
  {
    title: "Projects",
    icon: "sidebar/folder",
    link: "/projects",
    hint: "⌘ + P",
  },
  {
    title: "Integrations",
    icon: "sidebar/integrations",
    link: "/integrations",
  },
]);

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

const { session } = useSession();
async function onSignOut() {
  if (!session.value) return;

  await signOut({ sessionId: session.value.id });

  await router.push("/auth");
  location.reload();
}

const { user, isLoaded } = useUser();
const { signOut } = useClerk();
</script>

<template>
  <div
    class="flex w-[250px] flex-col rounded-br-2xl rounded-tr-2xl bg-black px-[18px] py-4"
    :class="{ '!w-[60px] !px-[13px]': compact }"
  >
    <!--    title block-->
    <div class="relative flex items-center justify-between">
      <div
        v-if="isLoaded && user"
        ref="userEl"
        @click="openPanel = !openPanel"
        class="!hover:text-white flex cursor-pointer items-center from-[#1A1A1A] to-[#141414] transition-colors hover:bg-gradient-to-r"
        :class="{
          'max-w-[85%] space-x-2 px-[1px] py-0.5': !compact,
          'w-full p-0.5': compact,
        }"
      >
        <img
          src="@assets/img/gregor.png"
          :alt="user.fullName ?? undefined"
          class="!h-[34px] !w-[34px] shrink-0 overflow-hidden rounded-full"
        />
        <p
          v-if="!compact"
          class="overflow-hidden text-ellipsis whitespace-nowrap text-gray-200"
        >
          {{ user.fullName }}
        </p>
      </div>
      <Icon
        v-if="!compact"
        v-hint="'['"
        name="sidebar/sidebar-left"
        class="cursor-pointer text-gray-200"
        @click="compact = !compact"
      ></Icon>
      <div
        ref="panelEl"
        class="absolute bottom-0 left-0 right-0 translate-y-[calc(100%+4px)] space-y-2 rounded-md border border-gray-900 bg-gradient-to-r from-[#1A1A1A] to-[#141414] px-2 py-1.5"
        v-if="openPanel"
      >
        <button
          @click="gotoProfile"
          class="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-[14px] text-gray-200 transition-colors hover:bg-black hover:text-gray-50"
        >
          <span class="">Open profile</span>
          <span>⌘ + O</span>
        </button>
        <button
          @click="onSignOut"
          class="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-[14px] text-red-400 transition-colors hover:bg-black"
        >
          <span class="">Sign out</span>
          <Icon name="exit" class="!h-4 !w-4"></Icon>
        </button>
      </div>
    </div>
    <!--  navigation block-->
    <nav class="mt-6 space-y-1.5">
      <router-link
        class="flex items-center space-x-2 rounded px-1.5 py-1 text-base text-gray-200"
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
        <Icon :name="item.icon"></Icon>
        <span v-if="!compact">{{ item.title }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped></style>
