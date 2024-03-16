import { authedProcedure, router } from "../trpc";
import { db } from "../index";
import { apikeyTable, apikeyTableValidator } from "../models/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const apiKeys = router({
  getAll: authedProcedure.query((opts) => {
    return db
      .select()
      .from(apikeyTable)
      .where(eq(apikeyTable.authorId, opts.ctx.user.id))
      .execute();
  }),
  delete: authedProcedure.input(z.string()).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input;

    const [draft] = await db
      .select()
      .from(apikeyTable)
      .where(eq(apikeyTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    await db.delete(apikeyTable).where(eq(apikeyTable.id, targetId));

    return "done";
  }),
  create: authedProcedure.input(apikeyTableValidator).mutation((opts) => {
    const userId = opts.ctx.user.id;
    return db
      .insert(apikeyTable)
      .values({ ...opts.input, authorId: userId })
      .execute();
  }),
  update: authedProcedure.input(apikeyTableValidator).mutation(async (opts) => {
    const userId = opts.ctx.user.id;
    const targetId = opts.input.id;

    const [draft] = await db
      .select()
      .from(apikeyTable)
      .where(eq(apikeyTable.id, targetId))
      .execute();
    if (!draft) throw new TRPCError({ code: "NOT_FOUND" });

    if (draft.authorId !== userId)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return db
      .update(apikeyTable)
      .set(opts.input)
      .where(eq(apikeyTable.id, targetId))
      .execute();
  }),
});
