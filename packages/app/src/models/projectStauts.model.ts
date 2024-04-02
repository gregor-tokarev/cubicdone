import { defineSchema, string } from "sync-client";

export interface ProjectStatus {
  id: string;
  title: string;
  icon: string;
}

export const projectStatusStore = defineSchema("projectStatus", {
  id: string("id").primaryKey(),
  title: string("title"),
  icon: string("icon"),
});
