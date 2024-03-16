import { defineSchema, integer, string } from "sync-client";

export interface Project {
  id: string;
  title: string;
  color: string;
  order: number;
}

export const projectStore = defineSchema("project", {
  id: string("id").primaryKey(),
  title: string("title"),
  color: string("color"),
  order: integer("order"),
});

export interface ProjectStatistic {
  project: Project;
  draftCount: number;
  taskCompletedCount: number;
  taskActiveCount: number;
}
