import { defineSchema, string } from "sync-client";

export const projectStatusStore = defineSchema("projectStatus", {
  id: string("id").primaryKey(),
  title: string("title"),
  icon: string("icon"),
});

export type ProjectStatus = {
  id: string;
  title: string;
  icon: string;
};
