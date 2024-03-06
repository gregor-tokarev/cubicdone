import { defineSchema, string } from "sync-client";

export interface ApiKey {
  id: string;
  label: string;
  key: string;
  integrationId: string;
}

export const apiKeyTable = defineSchema("apikeys", {
  id: string("id").primaryKey(),
  label: string("label"),
  key: string("key"),
  integrationId: string("integrationId"),
});
