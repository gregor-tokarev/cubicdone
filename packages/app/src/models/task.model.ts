import { defineSchema, integer, string } from "sync-client";
import { createdAt } from "sync-client/src/columns/createdAt.ts";

export type Task = {
  id: string;
  draftId: string;
  title: string;
  status: "todo" | "done";
  order: number;
  dateCreated: string;
  dateUpdated: string;
  dateCommitted: string;
  dateCompleted: string | null;
  dateTodo: string;
  projectId: string | null;
  external?: {
    integrationName: string;
    projectTitle?: string;
    projectId?: string;
    link: string;
    iconURL: string;
  };
};

export const taskStore = defineSchema("task", {
  id: string("id").primaryKey(),
  draftId: string("draftId"),
  title: string("title"),
  status: string<"todo" | "done">("status"),
  order: integer("order"),
  dateCreated: createdAt("dateCreated"),
  dateUpdated: string("dateUpdated"),
  dateCommitted: string("dateCommitted"),
  dateCompleted: string("dateCompleted"),
  dateTodo: string("dateTodo"),
  projectId: string("projectId"),
});
