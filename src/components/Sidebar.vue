<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core/index.cjs";
import hotkeys from "hotkeys-js";

const navItems = ref([
  {
    title: "Plan",
    icon: "plan",
    link: "/",
    hint: "⌘ + G",
  },
  {
    title: "Inbox",
    icon: "inbox",
    link: "/inbox",
    hint: "⌘ + I",
  },
  {
    title: "Projects",
    icon: "folder",
    link: "/projects",
    hint: "⌘ + P",
  },
  {
    title: "Integrations",
    icon: "integrations",
    link: "/integrations",
  },
]);

const breakpoints = useBreakpoints(breakpointsTailwind);

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
</script>

<template>
  <div
    class="flex w-[250px] flex-col rounded-br-2xl rounded-tr-2xl bg-black px-[18px] py-4"
    :class="{ '!w-[60px] !px-[13px]': compact }"
  >
    <!--    title block-->
    <div class="flex items-center justify-between">
      <div
        class="!hover:text-white flex cursor-pointer items-center from-[#1A1A1A] to-[#141414] transition-colors hover:bg-gradient-to-r"
        :class="{
          'space-x-2 px-[1px] py-0.5 ': !compact,
          'w-full p-0.5': compact,
        }"
      >
        <img
          src="@assets/img/gregor.png"
          alt="gregor tokarev"
          class="!h-[34px] !w-[34px] overflow-hidden rounded-full"
        />
        <p v-if="!compact" class="text-gray-200">Gregor</p>
      </div>
      <Icon
        v-if="!compact"
        v-hint="'['"
        name="sidebar-left"
        class="cursor-pointer text-gray-200"
        @click="compact = !compact"
      ></Icon>
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
