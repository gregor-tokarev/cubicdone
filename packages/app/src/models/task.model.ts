import { createdAt, defineSchema, integer, string, object } from "sync-client";

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
  external: {
    integrationName: string;
    projectTitle?: string;
    projectId?: string;
    link: string;
    iconURL: string;
  } | null;
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
  external: object("external"),
});
