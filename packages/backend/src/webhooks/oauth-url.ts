import { generateState } from "arctic";
import { Response, Router } from "express";
import { google, notion } from "../auth/providers";
import { stateCookieName, verifierCookieName } from "../auth/lucia";
import { strict } from "assert";

const oauthUrlRouter = Router();

function genVerifier() {
  return Math.random().toString(36).substring(7);
}

function setCookies(res: Response, state: string, codeVerifier?: string) {
  res.cookie(stateCookieName, state, {
    path: "/",
    maxAge: 3 * 60 * 1000, // 3 minutes
    domain: "cubicdone.com",
    httpOnly: true,
    sameSite: "lax",
  });

  codeVerifier &&
    res.cookie(verifierCookieName, codeVerifier, {
      path: "/",
      maxAge: 3 * 60 * 1000, // 3 minutes
      domain: "cubicdone.com",
      httpOnly: true,
      sameSite: "lax",
    });
}

oauthUrlRouter.get("/google", async (req, res) => {
  const state = generateState();
  const codeVerifier = genVerifier();

  const authURL = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  setCookies(res, state, codeVerifier);

  res.redirect(authURL.toString());
});

oauthUrlRouter.get("/notion", async (req, res) => {
  const state = generateState();
  const authUrl = await notion.createAuthorizationURL(state);

  setCookies(res, state);

  res.redirect(authUrl.toString());
});

export { oauthUrlRouter };
