<script setup lang="ts">
import ProjectModal from "@components/ProjectModal.vue";
import DeleteModal from "@components/DeleteModal.vue";
import Sidebar from "@components/Sidebar.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { onMounted } from "vue";
import hotkeys from "hotkeys-js";
import { useRouter } from "vue-router";
import { useUser } from "vue-clerk";
import { VueSpinnerPuff } from "vue3-spinners";

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

const { isLoaded } = useUser();
// watchEffect(() => {
// to ensure, that it's not undefined which will mean that it's still fetching
// if (isSignedIn.value === false) {
//   router.replace("/auth");
// }
// });
</script>

<template>
  <div v-if="isLoaded" class="flex h-[100vh] items-start">
    <Sidebar class="h-full"></Sidebar>
    <div class="relative h-full grow overflow-y-auto" data-scroll-container>
      <div class="relative mx-auto h-full max-w-[980px]" data-office-wrapper>
        <router-view></router-view>
      </div>
    </div>
  </div>
  <div v-else class="fixed inset-0 flex items-center justify-center bg-white">
    <VueSpinnerPuff size="200px" color="#333"></VueSpinnerPuff>
  </div>
  <ProjectModal></ProjectModal>
  <DeleteModal></DeleteModal>
  <SpeedInsights></SpeedInsights>
</template>

<style scoped></style>
