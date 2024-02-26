<script setup lang="ts">
import BaseModal from "@components/BaseModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useIntegrationStore } from "@store/integration.ts";
import { computed, onMounted, ref } from "vue";
import { Integration, IntegrationProject } from "@models/integration.model.ts";
import Icon from "@components/Icon.vue";
import ProjectSelect from "@components/UI/ProjectSelect.vue";
import BaseSelect from "@components/UI/BaseSelect.vue";
import SkeletonLoader from "@components/UI/SkeletonLoader.vue";
import { useLocalStorage } from "@vueuse/core";

const router = useRouter();
const route = useRoute();

const integrationStore = useIntegrationStore();

const integration = computed<Integration | undefined>(() => {
  return integrationStore.mappedIntegrations.find(
    (i) => i.name === route.params["integration_name"],
  );
});

const projectsLoading = ref(true);
const projects = ref<IntegrationProject[]>([]);
const projectOptions = computed(() => {
  return projects.value.map((p) => ({
    id: p.id,
    value: p.id,
    label: p.name,
  }));
});

onMounted(async () => {
  if (!integration.value) return;

  projects.value = await integration.value?.fetchProjects();
  projectsLoading.value = false;
});

const projectsMap = useLocalStorage<
  { externalId: string | null; internalId: string | null }[]
>("map", []);
function onCreateLink() {
  projectsMap.value.push({ externalId: null, internalId: null });
}
</script>

<template>
  <teleport to="body">
    <BaseModal @cancel="router.push('/integrations')">
      <div v-if="integration" class="w-[720px]">
        <div class="flex items-center space-x-2">
          <img :src="integration.iconURL" :alt="integration.name" />
          <span class="text-xl capitalize">{{ integration.name }}</span>
        </div>
        <div class="mb-2 mt-8 flex text-xs text-gray-600">
          <span class="mr-[61%] capitalize">
            {{ integration.name }} project
          </span>
          <span>Todo project</span>
        </div>
        <div v-if="!projectsLoading" class="">
          <div class="space-y-4">
            <div v-for="m in projectsMap" class="flex items-center">
              <BaseSelect
                class="w-[33%]"
                :options="projectOptions"
                v-model="m.externalId"
              ></BaseSelect>
              <div class="mx-2.5 h-[1px] max-w-[36%] grow bg-gray-300"></div>
              <ProjectSelect
                class="w-[30%]"
                v-model="m.internalId"
              ></ProjectSelect>
            </div>
          </div>
          <div
            class="mt-6 inline-flex cursor-pointer items-center space-x-1.5 rounded-lg px-1.5 py-[3px] text-gray-600 transition-colors hover:bg-gray-400 hover:text-black"
            @click="onCreateLink"
          >
            <Icon name="link"></Icon>
            <span>Link new project</span>
          </div>
        </div>
        <div v-else class="">
          <div class="space-y-4">
            <div v-for="() in projectsMap" class="flex justify-between">
              <SkeletonLoader class="h-8 w-[33%]"></SkeletonLoader>
              <SkeletonLoader class="h-8 w-[30%]"></SkeletonLoader>
            </div>
          </div>
          <SkeletonLoader class="mt-6 h-[34px] w-[30%]"></SkeletonLoader>
        </div>
      </div>
    </BaseModal>
  </teleport>
</template>

<style scoped></style>
