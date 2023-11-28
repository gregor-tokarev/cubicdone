<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
import Combokeys from "combokeys";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const combokeys = new Combokeys(document.documentElement);
onMounted(() => {
  combokeys.bind("g i", () => {
    router.push("/inbox");
  });

  combokeys.bind("g p", () => {
    router.push("/projects");
  });

  combokeys.bind("g r", () => {
    router.push("/");
  });
});
</script>

<template>
  <div class="flex items-start">
    <Sidebar class="h-[100vh]"></Sidebar>
    <div class="max-h-screen grow overflow-y-auto">
      <div class="mx-auto max-w-[980px]">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
