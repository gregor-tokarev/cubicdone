<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
import {onMounted} from "vue";
import hotkeys from "hotkeys-js";
import {useRouter} from "vue-router";

const router = useRouter()

onMounted(() => {
  // go to inbox page hotkey
  hotkeys("cmd+i", evt => {
    evt.preventDefault()
    router.push("/inbox")
  })
  // go to plan page hotkey
  hotkeys("cmd+g", evt => {
    evt.preventDefault()
    router.push("/plan")
  })
})
</script>

<template>
  <div class="flex items-start">
    <Sidebar class="h-[100vh] w-[250px]"></Sidebar>
    <div class="grow">
      <div class="max-w-[980px] mx-auto">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
