<script setup lang="ts">
import ProjectModal from "@components/ProjectModal.vue";
import DeleteModal from "@components/DeleteModal.vue";
import Sidebar from "@components/Sidebar.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { onMounted } from "vue";
import hotkeys from "hotkeys-js";
import { useRouter } from "vue-router";

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

  hotkeys("cmd+p", (evt) => {
    evt.preventDefault();
    router.push("/projects");
  });

  hotkeys("cmd+o", (evt) => {
    evt.preventDefault();
    router.push("/profile");
  });
});
</script>

<template>
  <div class="flex h-[100vh] items-start">
    <Sidebar class="h-full"></Sidebar>
    <div class="relative h-full grow overflow-y-auto" data-scroll-container>
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
