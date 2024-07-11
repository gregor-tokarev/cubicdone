import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../db";
import { sessionTable, userTable } from "../models/schema";
import { Lucia, TimeSpan } from "lucia";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
