import { createdAt, defineSchema, integer, string, object } from "sync-client";

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
