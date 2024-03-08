import { Hono } from "hono";
import { db } from "../index";
import { taskTable } from "../models/schema";
import { eq } from "drizzle-orm";

const tasks = new Hono();

tasks.post("", async (c) => {
  const body = await c.req.json();

  try {
    const result = await db.insert(taskTable).values(body).execute();

    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "An error occurred while creating the task." }, 500);
  }
});

tasks.get("", async (c) => {
  try {
    const result = await db.select().from(taskTable).execute();
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "An error occurred while fetching tasks." }, 500);
  }
});

tasks.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const result = await db
      .update(taskTable)
      .set(body)
      .where(eq(taskTable.id, id))
      .execute();
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "An error occurred while updating the task." }, 500);
  }
});

tasks.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const result = await db
      .delete(taskTable)
      .where(eq(taskTable.id, id))
      .execute();

    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "An error occurred while deleting the task." }, 500);
  }
});

export default tasks;
