<script setup lang="ts">
import { IntegrationItem } from "../../models/integration.model.ts";

defineProps<{
  integration: IntegrationItem;
}>();
</script>

<template>
  <div class="border-gray-150 rounded-lg border p-5 pb-0"></div>
</template>

<style scoped></style>
