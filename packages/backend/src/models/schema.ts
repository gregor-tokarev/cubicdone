import { pgTable } from "drizzle-orm/pg-core/table";
import { integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const taskTable = pgTable("task", {
  id: varchar("id").primaryKey(),
  draftId: varchar("draftId"),
  title: varchar("title"),
  status: varchar("status"),
  order: integer("order"),
  dateCreated: timestamp("dateCreated").defaultNow(),
  dateUpdated: timestamp("dateUpdated"),
  dateCommitted: varchar("dateCommitted"),
  dateCompleted: varchar("dateCompleted"),
  dateTodo: varchar("dateTodo"),
  projectId: varchar("projectId"),
});

export const projectTable = pgTable("project", {
  id: varchar("id").primaryKey(),
  title: varchar("title"),
  color: varchar("color"),
  order: integer("order"),
});

export const draft = pgTable("drafts", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  dateCreated: timestamp("dateCreated").defaultNow(),
  dateUpdated: timestamp("dateUpdated"),
  order: integer("order"),
  projectId: varchar("projectId"),
});

export const apikey = pgTable("apikeys", {
  id: varchar("id").primaryKey(),
  label: varchar("label").notNull(),
  key: varchar("key").notNull(),
  integrationId: varchar("integrationId").notNull(),
});
