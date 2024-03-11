import { defineSchema, integer, string } from "sync-client";
import { createdAt } from "sync-client/src/columns/createdAt.ts";

export interface Draft {
  id: string;
  title: string;
  dateCreated: string;
  dateUpdated: string;
  order: number;
  projectId: string | null;
  external?: {
    integrationName: string;
    projectTitle?: string;
    projectId?: string;
    link: string;
    iconURL: string;
  };
}

export const draftStore = defineSchema("draft", {
  id: string("id").primaryKey(),
  title: string("title"),
  dateCreated: createdAt("dateCreated").default(Date.now),
  dateUpdated: string("dateUpdated"),
  order: integer("order"),
  projectId: string("projectId"),
});
