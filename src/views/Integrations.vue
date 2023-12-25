<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import IntegrationCard from "@components/cards/IntegrationCard.vue";
import BaseModal from "@components/BaseModal.vue";
import BaseInput from "@components/UI/BaseInput.vue";
import BaseButton from "@components/UI/BaseButton.vue";
import Icon from "../components/Icon.vue";
import { useIntegrationStore } from "../store/integration.ts";
import { Integration } from "../models/integration.model.ts";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import ErrorMessage from "@components/ErrorMessage.vue";

const integrationStore = useIntegrationStore();
const router = useRouter();

const openIntegrationId = ref<null | string>(null);
const openIntegration = computed<Integration | undefined>(() => {
  return integrationStore.mappedIntegrations.find(
    (i) => i.id === openIntegrationId.value,
  );
});
watch(openIntegration, (value) => {
  if (value) formState.apiKeys = (value.apiKeys ?? []).concat([""]);
});

const formState = reactive({
  apiKeys: (openIntegration.value?.apiKeys ?? []).concat([""]),
});

const v$ = useVuelidate(
  {
    apiKeys: {
      each$: helpers.forEach({
        required: helpers.withMessage("Required field", required),
      }),
    },
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

function onUpdateApikey(key: string, idx: number) {
  if (idx === formState.apiKeys.length - 1) {
    if (key) {
      formState.apiKeys.push("");
    }
  } else {
    if (!key) {
      formState.apiKeys.splice(idx, 1);
    }
  }
  formState.apiKeys[idx] = key;
}
async function onSubmit() {
  if (v$.value.$error || !openIntegration.value) return;

  loading.value = true;
  showError.value = false;
  try {
    const res: boolean[] = await Promise.all(
      formState.apiKeys.filter(Boolean).map((apiKey: string) => {
        if (!openIntegration.value) return false;
        return openIntegration.value.checkToken(apiKey);
      }),
    );
    if (res.some((r) => !r)) {
      openIntegration.value.apiKeys = [];
      showError.value = true;

      return;
    }

    integrationStore.connect(openIntegration.value.id, v$.value.apiKeys.$model);

    openIntegrationId.value = "";
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
        <div class="mb-6 space-y-2">
          <div class="space-y-1">
            <div class="flex items-center space-x-1">
              <p class="text-xs capitalize text-gray-500">
                {{ openIntegration.name }} apiKey
              </p>
              <p v-if="v$.apiKeys.$errors[0]" class="text-xs text-red-400">
                {{ v$.apiKeys.$errors[0].$message }}
              </p>
            </div>
            <BaseInput
              v-for="(key, idx) in v$.apiKeys.$model"
              @enter="onSubmit"
              :model-value="key"
              @update:modelValue="onUpdateApikey($event, idx)"
              type="password"
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
