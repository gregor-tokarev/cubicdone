import { defineStore } from "pinia";
import { Integration } from "@models/integration.model.ts";
import { useLocalStorage } from "@vueuse/core";
import { LinearIntegration } from "../integrations/linear.integration.ts";
import { ClickupIntegration } from "../integrations/clickup.integration.ts";

export const useIntegrationStore = defineStore("integrations", {
  state: () => ({
    integrations: [
      new LinearIntegration("lin_1"),
      new LinearIntegration("lin_2"),
      new ClickupIntegration("clickup"),
    ] satisfies Integration[],
    apiKeys: useLocalStorage<Record<string, string>>("apiKeys", {}),
  }),

  actions: {
    connect(integrationId: string, apiKey: string): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      int.apiKey = apiKey;
      this.apiKeys[integrationId] = apiKey;
    },
    disconnect(integrationId: string): Integration | undefined {
      const int = this.integrations.find((i) => i.id === integrationId);
      if (!int) return;

      int.apiKey = "";
      delete this.apiKeys[integrationId];
    },
  },
  getters: {
    mappedIntegrations(state): Integration[] {
      return state.integrations.map((i) => {
        i.apiKey = state.apiKeys[i.id];
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
