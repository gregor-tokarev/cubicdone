<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
import {onMounted} from "vue";
import hotkeys from "hotkeys-js";
import {useRouter} from "vue-router";

const router = useRouter()

onMounted(() => {
  hotkeys.filter = function (event) {
    return true;
  }
  //How to add the filter to edit labels. <div contentEditable="true"></div>
  //"contentEditable" Older browsers that do not support drops
  hotkeys.filter = function (event) {
    const tagName = (event.target || event.srcElement).tagName;
    return !(tagName.isContentEditable || tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  hotkeys.filter = function (event) {
    const tagName = (event.target || event.srcElement).tagName;
    hotkeys.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other');
    return true;
  }

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
