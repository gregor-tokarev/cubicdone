import { authedProcedure, router } from "../trpc";
import { db } from "../db";
import { draftTable, draftTableValidator } from "../models/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const drafts = router({
  getAll: authedProcedure.query((opts) => {
    return db
      .select()
      .from(draftTable)
      .where(eq(draftTable.authorId, opts.ctx.user.id))
      .execute();
  }),
  delete: authedProcedure.input(z.string()).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input;

    const [draft] = await db
      .select()
      .from(draftTable)
      .where(eq(draftTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    await db.delete(draftTable).where(eq(draftTable.id, targetId));

    return "done";
  }),
  create: authedProcedure.input(draftTableValidator).mutation((opts) => {
    const userId = opts.ctx.user.id;
    return db
      .insert(draftTable)
      .values({ ...opts.input, authorId: userId })
      .execute();
  }),
  update: authedProcedure.input(draftTableValidator).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input.id;

    const [draft] = await db
      .select()
      .from(draftTable)
      .where(eq(draftTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return db
      .update(draftTable)
      .set(opts.input)
      .where(eq(draftTable.id, targetId))
      .execute();
  }),
});
