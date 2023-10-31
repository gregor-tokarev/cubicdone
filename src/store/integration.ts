import { defineStore } from "pinia";
import { Integration, LinearIntegration } from "../models/integration.model.ts";
import { useLocalStorage } from "@vueuse/core";

export const useIntegrationStore = defineStore("integrations", {
  state: () => ({
    integrations: [new LinearIntegration()] satisfies Integration[],
    apiKeys: useLocalStorage<Record<string, string>>("apiKeys", {}),
  }),

  actions: {
    connect(integrationName: string, apiKey: string): Integration | undefined {
      const int = this.integrations.find((i) => i.name === integrationName);
      if (!int) return;

      int.apiKey = apiKey;
      this.apiKeys[integrationName] = apiKey;
    },
    disconnect(integrationName: string): Integration | undefined {
      const int = this.integrations.find((i) => i.name === integrationName);
      if (!int) return;

      int.apiKey = "";
      delete this.apiKeys[integrationName];
    },
  },
  getters: {
    mappedIntegrations(state): Integration[] {
      return state.integrations.map((i) => {
        i.apiKey = state.apiKeys[i.name];
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
