import { defineSchema, string } from "sync-client";

export interface ApiKey {
  id: string;
  label: string;
  key: string;
}

export const apiKeyTable = defineSchema("apikeys", {
  id: string("id").primaryKey(),
  label: string("label").default(""),
  key: string("key"),
});
