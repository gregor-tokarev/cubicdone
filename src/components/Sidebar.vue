<script setup lang="ts">

import {ref} from "vue";
import Icon from "./Icon.vue";

const navItems = ref([
  {title: "Plan", icon: "plan", link: "/plan"},
  {title: "Inbox", icon: "inbox", link: "/inbox"}
])
</script>

<template>
  <div class="bg-black px-2.5 py-4 rounded-tr-2xl rounded-br-2xl space-y-8">
    <!--    title block-->
    <div class="flex items-center pb-2.5 border-b border-[#333333]">
      <img src="../assets/img/gregor.png" alt="gregor tokarev" class="w-[60px] h-[60px] rounded-full overflow-hidden">
      <div class="ml-2">
        <h1 class="text-base text-white">Personal todo</h1>
        <p class="text-xs text-gray-200">Gregor Tokarev</p>
      </div>
    </div>
    <!--  navigation block-->
    <nav class="space-y-1.5">
      <router-link class="flex items-center space-x-2 p-1.5 text-gray-300 text-base" v-for="item in navItems"
                   :to="item.link" active-class="!text-white bg-gradient-to-r from-[#1A1A1A] to-[#141414]">
        <Icon :name="item.icon"></Icon>
        <span>{{ item.title }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>

</style>
