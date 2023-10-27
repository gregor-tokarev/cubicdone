<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import IntegrationCard from "../components/cards/IntegrationCard.vue";
import BaseModal from "../components/BaseModal.vue";
import BaseInput from "../components/UI/BaseInput.vue";
import BaseButton from "../components/UI/BaseButton.vue";
import Icon from "../components/Icon.vue";
import { useIntegrationStore } from "../store/integration.ts";
import { Integration } from "../models/integration.model.ts";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";

const integrationStore = useIntegrationStore();

const openIntegrationName = ref("");
const openIntegration = computed<Integration | undefined>(() => {
  return integrationStore.mappedIntegrations.find(
    (i) => i.name === openIntegrationName.value,
  );
});

const formState = reactive({
  apiKey: "",
});
const v$ = useVuelidate(
  { apiKey: { required: helpers.withMessage("Required field", required) } },
  formState,
);
function onConnect(name: string) {
  openIntegrationName.value = name;
}

function onDisconnect(name: string) {
  openIntegrationName.value = "";
  integrationStore.disconnect(name);
}

const loading = ref(false);
async function onSubmit() {
  if (v$.value.$error || !openIntegration.value) return;

  loading.value = true;
  try {
    await openIntegration.value.checkToken(v$.value.apiKey.$model);

    integrationStore.connect(
      openIntegration.value.name,
      v$.value.apiKey.$model,
    );

    openIntegrationName.value = "";
  } catch (e) {
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="pt-8">
    <div class="mb-10 flex items-center justify-between">
      <h1 class="text-xl">Integrations</h1>
    </div>
    <div class="">
      <IntegrationCard
        v-for="(i, idx) in integrationStore.mappedIntegrations"
        :integration="i"
        :key="idx"
        @connect="onConnect(i.name)"
        @disconnect="onDisconnect(i.name)"
      ></IntegrationCard>
    </div>
  </div>
  <teleport to="body">
    <BaseModal
      v-if="openIntegrationName && openIntegration"
      @cancel="openIntegrationName = ''"
    >
      <div class="w-[670px]">
        <div class="mb-6 flex items-center space-x-2">
          <img :src="openIntegration.iconURL" :alt="openIntegration.name" />
          <h2 class="text-xl">Linear</h2>
        </div>
        <div class="mb-9 space-y-1">
          <div class="flex items-center space-x-1">
            <p class="text-xs capitalize text-gray-250">
              {{ openIntegration.name }} apiKey
            </p>
            <p v-if="v$.apiKey.$errors[0]" class="text-xs text-red-400">
              {{ v$.apiKey.$errors[0].$message }}
            </p>
          </div>
          <BaseInput
            v-model="v$.apiKey.$model"
            :error="v$.apiKey.$error"
            @blur="v$.apiKey.$touch"
            type="password"
            placeholder="lin_api_k7Yk0QrBjjdTyzBAAHiW1SyTR23ycZoZHu3eHfGU"
          ></BaseInput>
        </div>
        <div class="flex space-x-2">
          <BaseButton @click="onSubmit" :loading="loading">
            <div class="flex items-center space-x-1">
              <span>Connect</span>
              <Icon name="arrow" class="h-5 w-5 rotate-90"></Icon>
            </div>
          </BaseButton>
          <BaseButton color="gray" @click="openIntegrationName = ''">
            Cancel
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </teleport>
</template>

<style scoped></style>
