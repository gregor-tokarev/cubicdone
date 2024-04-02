import { authedProcedure, router } from "../trpc";
import { db } from "../index";
import { projectStatusTable } from "../models/schema";

export const projectStatus = router({
  getAll: authedProcedure.query(() => {
    return db.select().from(projectStatusTable).execute();
  }),
});
