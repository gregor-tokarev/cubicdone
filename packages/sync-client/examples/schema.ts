import { defineSchema } from "../src";
import { integer } from "../src";
import { string } from "../src";

const tasks = defineSchema("tasks", {
  id: integer("id").default(2234).primaryKey(),
  title: string("title").index(),
});
