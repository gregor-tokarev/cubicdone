<template>
  <div
    class="flex items-center space-x-2.5 rounded-lg bg-red-400/10 px-3 py-2 text-red-400"
  >
    <div
      class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/20"
    >
      <Icon name="attention"></Icon>
    </div>
    <span><slot></slot></span>
  </div>
</template>

<script setup lang="ts">
import Icon from "../components/Icon.vue";
</script>
