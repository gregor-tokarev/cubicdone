import { NextFunction, Request, Router, Response } from "express";
import { google, notion } from "../auth/providers";
import { db } from "../db";
import { userTable } from "../models/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { lucia, stateCookieName, verifierCookieName } from "../auth/lucia";

export function sameOauthState() {
  return (req: Request, res: Response, next: NextFunction) => {
    const state = req.query["state"];

    const localState = req.cookies[stateCookieName];

    if (localState !== state) {
      return res.status(400).json({ message: "state mismatch" });
    }

    return next();
  };
}

async function defaultResponse(
  user: InferSelectModel<typeof userTable>,
  res: Response,
) {
  const session = await lucia.createSession(user.id, {});

  res.cookie("session", session.id, {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    domain: "cubicdone.com",
    sameSite: "lax",
  });

  return res.redirect("https://app.cubicdone.com");
}

const oauthRedirectRouter = Router();

oauthRedirectRouter.get("/google", async (req, res) => {
  const code = req.query["code"];
  const codeVerifier = req.cookies[verifierCookieName];

  const tokens = await google.validateAuthorizationCode(
    code as string,
    codeVerifier,
  );

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const user = await response.json();

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, user["email"]))
    .execute();

  if (existingUser) {
    return defaultResponse(existingUser, res);
  }

  const [newUser] = await db
    .insert(userTable)
    .values({
      email: user["email"],
      firstName: user["given_name"],
      lastName: user["family_name"],
      avatar: user["picture"],
    })
    .returning();

  return defaultResponse(newUser, res);
});

oauthRedirectRouter.get("/notion", async (req, res) => {
  const code = req.query["code"];

  console.log(code);
  const tokens = await notion.validateAuthorizationCode(code as string);
  console.log(tokens);
  const response = await fetch("https://api.notion.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const user = await response.json();
  console.log(user);
});

export { oauthRedirectRouter };
