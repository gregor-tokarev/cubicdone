import { defineSchema } from "../src";
import { int } from "../src/columns/int";
import { string } from "../src/columns/string";

const tasks = defineSchema("tasks", {
  id: int("id").default(2234).primaryKey(),
  title: string("title").index(),
});
