<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { setScrolling } from "@utils/setScrolling.ts";
import { useDeleteModalStore } from "@store/delete-modal.ts";
import BaseButton from "@components/UI/BaseButton.vue";
import hotkeys from "hotkeys-js";

const deleteModalStore = useDeleteModalStore();

const HOTKEYS_SCOPE = "deleteModal";

watch(
  () => deleteModalStore.open,
  (value) => {
    if (value) {
      setScrolling(false);

      hotkeys("esc", HOTKEYS_SCOPE, () => {
        deleteModalStore.resolveFn && deleteModalStore.resolveFn(false);
        deleteModalStore.close();
      });

      hotkeys("enter", HOTKEYS_SCOPE, () => {
        deleteModalStore.resolveFn && deleteModalStore.resolveFn(true);
        deleteModalStore.close();
      });
    } else {
      hotkeys.unbind("esc");
      setScrolling(true);
    }
  },
);

const cancelButton = ref<HTMLElement | null>(null);
const submitButton = ref<HTMLElement | null>(null);

onMounted(() => {
  hotkeys.setScope(HOTKEYS_SCOPE);
});

onUnmounted(() => {
  hotkeys.setScope("all");
});

function onButtonClick(value: boolean) {
  deleteModalStore.resolveFn && deleteModalStore.resolveFn(value);

  deleteModalStore.close();
}
</script>

<template>
  <teleport to="[data-scroll-container]">
    <div
      v-if="deleteModalStore.open && deleteModalStore.modalOptions !== null"
      class="fixed left-1/2 top-1/2 z-10 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray-50 p-6 shadow-xl"
    >
      <h2 class="mb-2.5 text-gray-900">
        {{ deleteModalStore.modalOptions.titleText }}
      </h2>
      <p class="mb-6 text-gray-600">
        {{ deleteModalStore.modalOptions.descriptionText }}
      </p>
      <div v-if="deleteModalStore.resolveFn" class="flex justify-end space-x-2">
        <BaseButton
          ref="cancelButton"
          @click="onButtonClick(false)"
          color="gray"
          >Cancel</BaseButton
        >
        <BaseButton
          class="shadow-gray-900 focus:shadow-2xl"
          ref="submitButton"
          @click="onButtonClick(true)"
          >Delete</BaseButton
        >
      </div>
    </div>
  </teleport>
  <teleport to="body">
    <div
      v-if="deleteModalStore.open"
      @click="deleteModalStore.close()"
      class="fixed inset-0"
    ></div>
  </teleport>
</template>

<style scoped></style>
