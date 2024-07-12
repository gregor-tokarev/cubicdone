import { initTRPC, TRPCError } from "@trpc/server";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { lucia } from "./auth/lucia";

interface Context extends NodeHTTPCreateContextFnOptions<any, any> {}

export async function createContext({ req }: Context) {
  const sessionCookie = req.headers["authorization"];

  if (!sessionCookie) return { user: null };

  try {
    const { user, session } = await lucia.validateSession(sessionCookie);

    return { user, session };
  } catch (err) {
    console.error(err);
  }
}

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthorized = t.middleware((opts) => {
  if (!("user" in opts.ctx) || !opts.ctx.user)
    throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      user: opts.ctx.user,
      session: opts.ctx.session,
    },
  });
});

export const authedProcedure = t.procedure.use(isAuthorized);
