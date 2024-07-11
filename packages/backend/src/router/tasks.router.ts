import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { taskTable, tasksTableValidator } from "../models/schema";
import { authedProcedure, router } from "../trpc";

export const tasks = router({
  getAll: authedProcedure
    .input(z.object({ date: z.string(), lastNDays: z.number().default(30) }))
    .query(async (opts) => {
      return db
        .select()
        .from(taskTable)
        .where(
          and(
            gte(
              taskTable.dateTodo,
              dayjs(opts.input.date)
                .subtract(opts.input.lastNDays, "days")
                .format(),
            ),
            eq(taskTable.authorId, opts.ctx.user.id),
          ),
        )
        .execute();
    }),
  delete: authedProcedure.input(z.string()).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input;

    const [draft] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    await db.delete(taskTable).where(eq(taskTable.id, targetId));

    return "done";
  }),
  create: authedProcedure.input(tasksTableValidator).mutation((opts) => {
    const userId = opts.ctx.user.id;
    return db
      .insert(taskTable)
      .values({ ...opts.input, authorId: userId })
      .execute();
  }),
  update: authedProcedure.input(tasksTableValidator).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input.id;

    const [draft] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return db
      .update(taskTable)
      .set(opts.input)
      .where(eq(taskTable.id, targetId))
      .execute();
  }),
});
