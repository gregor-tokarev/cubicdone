import { createdAt, defineSchema, integer, string } from "sync-client";

export const draftStore = defineSchema("draft", {
  id: string("id").primaryKey(),
  title: string("title"),
  dateCreated: createdAt("dateCreated").default(Date.now),
  dateUpdated: string("dateUpdated"),
  order: integer("order"),
  projectId: string("projectId"),
});
