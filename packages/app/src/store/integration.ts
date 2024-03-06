import { defineStore } from "pinia";
import { Integration } from "@models/integration.model.ts";
import { LinearIntegration } from "../integrations/linear.integration.ts";
import { nanoid } from "nanoid";
import { ApiKey, apiKeyTable } from "@models/api-key.model.ts";
import { idbContextManager } from "../main.ts";

export const useIntegrationStore = defineStore("integrations", {
  state: () => ({
    integrations: [new LinearIntegration("lin_1")] satisfies Integration[],
    apiKeys: {} as Record<string, ApiKey[]>,
  }),

  actions: {
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
      } satisfies ApiKey;

      idbContextManager.putItem(apiKeyTable, key);

      int.apiKeys.push(key);
      this.apiKeys[integrationId] = int.apiKeys;
    },
    disconnect(
      integrationId: string,
      apiKeyId: string,
    ): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      const keyIdx = int.apiKeys.findIndex((key) => key.id === apiKeyId);

      idbContextManager.deleteItem(apiKeyTable, apiKeyId);

      int.apiKeys.splice(keyIdx, 1);
      this.apiKeys[integrationId] = int.apiKeys;
    },
  },
  getters: {
    mappedIntegrations(state): Integration[] {
      return state.integrations.map((i: Integration) => {
        i.apiKeys = state.apiKeys[i.id] ?? [];
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
