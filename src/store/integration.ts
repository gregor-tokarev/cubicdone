import { defineStore } from "pinia";
import { Integration } from "@models/integration.model.ts";
import { useLocalStorage } from "@vueuse/core";
import { LinearIntegration } from "../integrations/linear.integration.ts";

export const useIntegrationStore = defineStore("integrations", {
  state: () => ({
    integrations: [new LinearIntegration("lin_1")] satisfies Integration[],
    apiKeys: useLocalStorage<Record<string, string[]>>("apiKeys", {}),
  }),

  actions: {
    connect(integrationId: string, apiKeys: string[]): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      const keys = apiKeys.filter(Boolean);
      int.apiKeys = int.apiKeys.concat(keys);
      this.apiKeys[integrationId] = keys;
    },
    disconnect(integrationId: string): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      int.apiKeys = [];
      delete this.apiKeys[integrationId];
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
