<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/vue";
import Sidebar from "./components/Sidebar.vue";
import { onMounted } from "vue";
import hotkeys from "hotkeys-js";
import { useRouter } from "vue-router";
import ProjectModal from "@components/ProjectModal.vue";
import DeleteModal from "@components/DeleteModal.vue";

const router = useRouter();

onMounted(() => {
  hotkeys.filter = (event) => {
    if (event.metaKey) return true;

    const target = event.target as HTMLElement;
    const tagName = target?.tagName;

    return !(
      target.isContentEditable ||
      tagName == "INPUT" ||
      tagName == "SELECT" ||
      tagName == "TEXTAREA"
    );
  };

  // go to inbox page hotkey
  hotkeys("cmd+i", (evt) => {
    evt.preventDefault();
    router.push("/inbox");
  });

  // go to plan page hotkey
  hotkeys("cmd+g", (evt) => {
    evt.preventDefault();
    router.push("/");
  });

  hotkeys("cmd+P", (evt) => {
    evt.preventDefault();
    router.push("/projects");
  });
});
</script>

<template>
  <div class="flex items-start">
    <Sidebar class="h-[100vh]"></Sidebar>
    <div
      class="relative max-h-screen grow resize-none overflow-y-auto"
      data-scroll-container
    >
      <div class="mx-auto max-w-[980px]">
        <router-view></router-view>
      </div>
    </div>
  </div>
  <ProjectModal></ProjectModal>
  <DeleteModal></DeleteModal>
  <SpeedInsights></SpeedInsights>
</template>

<style scoped></style>
