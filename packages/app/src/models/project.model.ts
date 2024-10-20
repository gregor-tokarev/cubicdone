import { defineSchema, integer, string } from "sync-client";

export const projectStore = defineSchema("project", {
  id: string("id").primaryKey(),
  title: string("title"),
  color: string("color"),
  order: integer("order"),
  statusId: string("statusId"),
});

export type Project = {
  id: string;
  title: string;
  color: string;
  order: number;
  statusId: string | null;
};
