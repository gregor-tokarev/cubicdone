import { generateState } from "arctic";
import { Router } from "express";
import { google } from "../auth/providers";
import { db } from "../db";
import { userTable } from "../models/schema";
import { eq } from "drizzle-orm";
import { lucia } from "../auth/lucia";

const oauthRouter = Router();

const stateCookieName = "state";
const verifierCookieName = "codeVerifier";

oauthRouter.get("/google", async (req, res) => {
  const state = generateState();

  const codeVerifier = Math.random().toString(36).substring(7);

  const authURL = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  console.log(authURL.toString());

  res.cookie(stateCookieName, state, {
    path: "/",
    maxAge: 3 * 60 * 1000,
    domain: "cubicdone.com",
    httpOnly: true,
    sameSite: "lax",
  });

  res.cookie(verifierCookieName, codeVerifier, {
    path: "/",
    maxAge: 3 * 60 * 1000,
    domain: "cubicdone.com",
    httpOnly: true,
    sameSite: "lax",
  });

  res.redirect(authURL.toString());
});

oauthRouter.get("/redirect/google", async (req, res) => {
  const state = req.query["state"];
  const code = req.query["code"];

  const localState = req.cookies[stateCookieName];

  if (localState !== state) {
    return res.status(400).json({ message: "state mismatch" });
  }

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

  const email = user["email"];

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .execute();

  if (existingUser) {
    const session = await lucia.createSession(existingUser.id, {});
    console.log(session);

    res.cookie("session", lucia.createSessionCookie(session.id).value, {
      maxAge: 60 * 60,
      sameSite: "lax",
    });

    return res.redirect("https://app.cubicdone.com");
  }

  const [newUser] = await db
    .insert(userTable)
    .values({ id: "sdfsf", email })
    .returning();

  const session = await lucia.createSession(newUser.id, {});

  res.cookie("session", lucia.createSessionCookie(session.id).value, {
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  return res.redirect("https://app.cubicdone.com");
});

export { oauthRouter };
