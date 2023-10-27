<script setup lang="ts">
import BaseModal from "../../components/BaseModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useIntegrationStore } from "../../store/integration.ts";
import { computed, onMounted, ref } from "vue";
import {
  Integration,
  IntegrationProject,
} from "../../models/integration.model.ts";
import BaseButton from "../../components/UI/BaseButton.vue";
import Icon from "../../components/Icon.vue";
import BaseSelect from "../../components/UI/BaseSelect.vue";

const router = useRouter();
const route = useRoute();

const integrationStore = useIntegrationStore();

const integration = computed<Integration | undefined>(() => {
  return integrationStore.mappedIntegrations.find(
    (i) => i.name === route.params["integration_name"],
  );
});

const projects = ref<IntegrationProject[]>([]);
const projectOptions = computed(() => {
  return projects.value.map((p) => ({ id: p.id, value: p.id, label: p.name }));
});

onMounted(async () => {
  if (!integration.value) return;

  projects.value = await integration.value?.fetchProjects();
});
</script>

<template>
  <teleport to="body">
    <BaseModal @cancel="router.push('/integrations')">
      <div v-if="integration" class="w-[720px]">
        <div class="flex items-center space-x-2">
          <img :src="integration.iconURL" :alt="integration.name" />
          <span class="text-xl capitalize">{{ integration.name }}</span>
        </div>
        <div class="mt-8 flex text-xs text-gray-350">
          <span class="mr-[55%] capitalize">
            {{ integration.name }} project
          </span>
          <span>Todo project</span>
        </div>
        <div class="">
          <BaseSelect :options="projectOptions" model-value=""></BaseSelect>
          <div
            class="mt-6 inline-flex cursor-pointer items-center space-x-1.5 rounded-lg px-1.5 py-[3px] text-gray-350 transition-colors hover:bg-gray-400 hover:text-black"
          >
            <Icon name="link"></Icon>
            <span>Link new project</span>
          </div>
        </div>
        <div class="mt-8 flex space-x-2">
          <BaseButton>
            <div class="flex items-center space-x-1">
              <span>Save</span>
              <Icon name="arrow" class="h-5 w-5 rotate-90"></Icon>
            </div>
          </BaseButton>
          <BaseButton color="gray"> Cancel </BaseButton>
        </div>
      </div>
    </BaseModal>
  </teleport>
</template>

<style scoped></style>
