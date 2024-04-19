import { defineSchema, string } from "sync-client";

export const apiKeyStore = defineSchema("apikeys", {
  id: string("id").primaryKey(),
  label: string("label"),
  key: string("key"),
  integrationId: string("integrationId"),
});
