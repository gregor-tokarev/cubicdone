import { pgTable } from "drizzle-orm/pg-core/table";
import { integer, json, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

export const taskTable = pgTable("task", {
  id: varchar("id").primaryKey(),
  draftId: varchar("draftId"),
  title: varchar("title"),
  status: varchar("status"),
  order: integer("order"),
  dateCreated: varchar("dateCreated"),
  dateUpdated: varchar("dateUpdated"),
  dateCommitted: varchar("dateCommitted"),
  dateCompleted: varchar("dateCompleted"),
  dateTodo: varchar("dateTodo"),
  projectId: varchar("projectId"),
  authorId: varchar("authorId").notNull(),
  external: json("external"),
});
export const tasksTableValidator = z.object({
  id: z.string(),
  draftId: z.string().nullish(),
  title: z.string(),
  status: z.string(),
  order: z.number(),
  dateCreated: z.string(),
  dateUpdated: z.string(),
  dateTodo: z.string(),
  projectId: z.string().nullish(),
  external: z.record(z.string(), z.string()).nullish(),
});

export const projectTable = pgTable("project", {
  id: varchar("id").primaryKey(),
  title: varchar("title"),
  color: varchar("color"),
  order: integer("order"),
  authorId: varchar("authorId").notNull(),
});
export const projectTableValidator = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  order: z.number(),
});

export const draftTable = pgTable("drafts", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  dateCreated: varchar("dateCreated"),
  dateUpdated: varchar("dateUpdated"),
  order: integer("order"),
  projectId: varchar("projectId"),
  authorId: varchar("authorId").notNull(),
});

export const draftTableValidator = z.object({
  id: z.string(),
  dateCreated: z.string(),
  dateUpdated: z.string(),
  order: z.number(),
  projectId: z.string().nullish(),
  title: z.string(),
});

export const apikeyTable = pgTable("apikeys", {
  id: varchar("id").primaryKey(),
  label: varchar("label").notNull(),
  key: varchar("key").notNull(),
  integrationId: varchar("integrationId").notNull(),
  authorId: varchar("authorId").notNull(),
});
export const apikeyTableValidator = z.object({
  id: z.string(),
  label: z.string(),
  key: z.string(),
  integrationId: z.string(),
});
