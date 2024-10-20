import { defineSchema, string } from "sync-client";

export const apiKeyStore = defineSchema("apikeys", {
  id: string("id").primaryKey(),
  label: string("label"),
  key: string("key"),
  integrationId: string("integrationId"),
});

export type ApiKey = {
  id: string;
  label: string;
  key: string;
  integrationId: string;
};
