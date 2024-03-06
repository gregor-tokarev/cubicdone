<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import IntegrationCard from "@components/cards/IntegrationCard.vue";
import BaseModal from "@components/BaseModal.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import BaseButton from "@components/UI/BaseButton.vue";
import Icon from "../../components/Icon.vue";
import { useIntegrationStore } from "@store/integration.ts";
import { Integration } from "@models/integration.model.ts";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import ErrorMessage from "@components/ErrorMessage.vue";
import ApiKeyCard from "@components/ApiKeyCard.vue";
import hotkeys from "hotkeys-js";

const integrationStore = useIntegrationStore();
const router = useRouter();

const openIntegrationId = ref<null | string>(null);
const openIntegration = computed<Integration | undefined>(() => {
  return integrationStore.mappedIntegrations.find(
    (i) => i.id === openIntegrationId.value,
  );
});

onMounted(async () => {
  await integrationStore.loadKeys();

  hotkeys("esc", onCancelModel);
});

onUnmounted(() => {
  hotkeys.unbind("esc", onCancelModel);
});

function onCancelModel() {
  openIntegrationId.value = null;
}

const formState = reactive({
  label: "",
  key: "",
});

const v$ = useVuelidate(
  {
    label: { required: helpers.withMessage("is required", required) },
    key: { required: helpers.withMessage("is required", required) },
  },
  formState,
);

function onConnect(id: string) {
  openIntegrationId.value = id;
}

function onDisconnect(id: string) {
  openIntegrationId.value = id;
}

const loading = ref(false);
const showError = ref(false);

async function onSubmit() {
  v$.value.$touch();
  if (v$.value.$error || !openIntegration.value) return;

  loading.value = true;
  showError.value = false;
  try {
    const res = await openIntegration.value.checkToken(v$.value.key.$model);

    if (!res) {
      showError.value = true;
      v$.value.key.$model = "";

      return;
    }

    integrationStore.connect(openIntegration.value.id, formState);

    formState.label = "";
    formState.key = "";
    v$.value.$reset();
  } finally {
    loading.value = false;
  }
}

function onRevoke(apiKeyId: string) {
  if (!openIntegration.value) return;
  integrationStore.disconnect(openIntegration.value.id, apiKeyId);
}
</script>

<template>
  <div class="pt-8">
    <div class="mb-10 flex items-center justify-between">
      <h1 class="text-xl">Integrations</h1>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <IntegrationCard
        v-for="(i, idx) in integrationStore.mappedIntegrations"
        :integration="i"
        :key="idx"
        @connect="onConnect(i.id)"
        @disconnect="onDisconnect(i.id)"
        @link="router.push(`/integrations/mapper/${i.name}`)"
      ></IntegrationCard>
    </div>
  </div>
  <teleport to="body">
    <BaseModal
      v-if="openIntegrationId && openIntegration"
      @cancel="openIntegrationId = ''"
    >
      <div class="w-[670px]">
        <div class="mb-6 flex items-center space-x-2">
          <img
            :src="openIntegration.iconURL"
            class="!h-6 !w-6 object-contain"
            :alt="openIntegration.name"
          />
          <h2 class="text-xl">{{ openIntegration.name }}</h2>
        </div>
        <div class="mb-9 space-y-3">
          <ApiKeyCard
            v-for="apiKey in openIntegration.apiKeys"
            :api-key="apiKey"
            :key="apiKey.id"
            @revoke="onRevoke(apiKey.id)"
          ></ApiKeyCard>
        </div>
        <div class="mb-5 space-y-3">
          <div class="space-y-0.5">
            <div class="flex items-center space-x-1">
              <p class="text-xs capitalize text-gray-500">Label</p>
              <p v-if="v$.label.$errors[0]" class="text-xs text-red-400">
                {{ v$.label.$errors[0].$message }}
              </p>
            </div>
            <BaseInput
              v-model="v$.label.$model"
              :error="v$.label.$error"
              :autocomplete="false"
              @blur="v$.label.$touch"
              type="text"
              placeholder="your_workspace"
            ></BaseInput>
          </div>
          <div class="space-y-0.5">
            <div class="flex items-center space-x-1">
              <p class="text-xs capitalize text-gray-500">
                {{ openIntegration.name }} apiKey
              </p>
              <p v-if="v$.key.$errors[0]" class="text-xs text-red-400">
                {{ v$.key.$errors[0].$message }}
              </p>
            </div>
            <BaseInput
              v-model="v$.key.$model"
              type="password"
              :autocomplete="false"
              :error="v$.key.$error"
              @blur="v$.key.$touch"
              placeholder="lin_api_k7Yk0QrBjjdTyzBAAHiW1SyTR23ycZoZHu3eHfGU"
            ></BaseInput>
          </div>
          <ErrorMessage v-if="showError">
            Ahtung! your api key is wrong, try to regenerate it
          </ErrorMessage>
        </div>
        <div class="flex space-x-2">
          <BaseButton @click="onSubmit" :loading="loading">
            <div class="flex items-center space-x-1">
              <span>Connect</span>
              <Icon name="arrow" class="h-5 w-5 rotate-90"></Icon>
            </div>
          </BaseButton>
          <BaseButton color="gray" @click="openIntegrationId = ''">
            Cancel
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </teleport>
</template>

<style scoped></style>
