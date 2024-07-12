import { authedProcedure, router } from "../trpc";
import { eq, InferSelectModel } from "drizzle-orm";
import { userTable } from "../models/schema";
import { z } from "zod";
import { db } from "../db";
import { lucia } from "../auth/lucia";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  current: authedProcedure.query((opt) => {
    return opt.ctx.user as InferSelectModel<typeof userTable>;
  }),
  logout: authedProcedure.mutation(async (opt) => {
    const sessionId = opt.ctx.session?.id;
    if (!sessionId) throw new TRPCError({ code: "UNAUTHORIZED" });

    await lucia.invalidateSession(sessionId);
  }),
  update: authedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .mutation(async (opt) => {
      const { firstName, lastName } = opt.input;

      const [user] = await db
        .update(userTable)
        .set({
          firstName,
          lastName,
        })
        .where(eq(userTable.id, opt.ctx.user.id))
        .returning()
        .execute();

      return user;
    }),
});
