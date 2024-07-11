import { authedProcedure, router } from "../trpc";
import { eq, InferSelectModel } from "drizzle-orm";
import { userTable } from "../models/schema";
import { z } from "zod";
import { db } from "../db";

export const authRouter = router({
  current: authedProcedure.query((opt) => {
    return opt.ctx.user as InferSelectModel<typeof userTable>;
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
