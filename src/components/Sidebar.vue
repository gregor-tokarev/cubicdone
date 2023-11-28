<script setup lang="ts">
import { ref } from "vue";
import Icon from "./Icon.vue";

const navItems = ref([
  {
    title: "Plan",
    icon: "plan",
    link: "/",
    hint: `G then R`,
  },
  {
    title: "Inbox",
    icon: "inbox",
    link: "/inbox",
    hint: `G then I`,
  },
  {
    title: "Projects",
    icon: "folder",
    link: "/projects",
    hint: `G then P`,
  },
  {
    title: "Integrations",
    icon: "integrations",
    link: "/integrations",
  },
]);

const compact = ref(window.innerWidth < 1400);
window.addEventListener("resize", (_) => {
  compact.value = window.innerWidth < 1400;
});
</script>

<template>
  <div
    class="flex w-[250px] flex-col rounded-br-2xl rounded-tr-2xl bg-black px-2.5 py-4"
    :class="{ '!w-[60px]': compact }"
  >
    <!--    title block-->
    <div class="flex items-center border-b border-gray-800 pb-2.5">
      <img
        src="@assets/img/gregor.png"
        alt="gregor tokarev"
        class="h-[60px] w-[60px] overflow-hidden rounded-full"
        :class="{ '!h-[40px] !w-[40px]': compact }"
      />
      <div v-if="!compact" class="ml-2">
        <h1 class="text-base text-white">Personal todo</h1>
        <p class="text-xs text-gray-700">Gregor Tokarev</p>
      </div>
    </div>
    <!--  navigation block-->
    <nav class="mt-8 space-y-1.5">
      <router-link
        class="flex items-center space-x-2 rounded-lg p-1.5 text-base text-gray-200"
        v-for="item in navItems"
        :to="item.link"
        v-hint="item.hint"
        active-class="!text-white bg-gradient-to-r from-[#1A1A1A] to-[#141414]"
      >
        <Icon :name="item.icon"></Icon>
        <span v-if="!compact">{{ item.title }}</span>
      </router-link>
    </nav>
    <div
      class="group mt-auto flex cursor-pointer items-center justify-between space-x-2 rounded-lg from-[#1A1A1A] to-[#141414] p-1.5 text-base text-gray-300 transition-colors hover:bg-gradient-to-r hover:text-white"
      @click="compact = !compact"
    >
      <span v-if="!compact">Hide Sidebar</span>
      <Icon
        name="double-arrow"
        class="text-gray-200 transition-colors group-hover:text-white"
        :class="{ 'rotate-180': compact }"
      ></Icon>
    </div>
  </div>
</template>

<style scoped></style>
