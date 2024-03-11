import { defineStore } from "pinia";
import { Integration } from "@models/integration.model.ts";
import { LinearIntegration } from "../integrations/linear.integration.ts";
import { nanoid } from "nanoid";
import { ApiKey, apiKeyStore } from "@models/api-key.model.ts";
import { idbContextManager } from "../main.ts";

export const useIntegrationStore = defineStore("integrations", {
  state: () => ({
    integrations: [new LinearIntegration("lin_1")] satisfies Integration[],
    apiKeys: [] as ApiKey[],
  }),

  actions: {
    async loadKeys() {
      this.apiKeys = await idbContextManager.getItems(apiKeyStore);
    },
    connect(
      integrationId: string,
      apiKey: { label: string; key: string },
    ): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      const keyId = nanoid(3);
      const key = {
        id: keyId,
        ...apiKey,
        integrationId: integrationId,
      } satisfies ApiKey;

      idbContextManager.putItem(apiKeyStore, key);

      int.apiKeys.push(key);
      this.apiKeys.push(key);
    },
    disconnect(
      integrationId: string,
      apiKeyId: string,
    ): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      const keyIdx = int.apiKeys.findIndex((key) => key.id === apiKeyId);

      idbContextManager.deleteItem(apiKeyStore, apiKeyId);

      int.apiKeys.splice(keyIdx, 1);

      const inx2 = this.apiKeys.findIndex((key) => key.id === apiKeyId);
      this.apiKeys.splice(inx2, 1);
    },
  },
  getters: {
    mappedIntegrations(state): Integration[] {
      return state.integrations.map((i: Integration) => {
        i.apiKeys = state.apiKeys.filter((key) => key.integrationId === i.id);
        return i;
      });
    },
    getByName(state) {
      return (integrationName: string): Integration | undefined => {
        return state.integrations.find((i) => i.name === integrationName);
      };
    },
  },
});
