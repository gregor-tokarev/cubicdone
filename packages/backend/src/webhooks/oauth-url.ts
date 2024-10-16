import { generateState } from "arctic";
import { Response, Router } from "express";
import { github, google, linear, notion } from "../auth/providers";
import { stateCookieName, verifierCookieName } from "../auth/lucia";
import { strict } from "assert";
import { stat } from "fs";

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

oauthUrlRouter.get("/notion", async (_req, res) => {
    const state = generateState();
    const authUrl = await notion.createAuthorizationURL(state);

    setCookies(res, state);

    res.redirect(authUrl.toString());
});

oauthUrlRouter.get("/linear", async (_req, res) => {
    const state = generateState();
    const authUrl = await linear.createAuthorizationURL(state);

    setCookies(res, state);

    res.redirect(authUrl.toString());
});

oauthUrlRouter.get("/github", async (_req, res) => {
    const state = generateState();
    const authUrl = await github.createAuthorizationURL(state, {
        scopes: ["user"],
    });

    setCookies(res, state);

    res.redirect(authUrl.toString());
});

export { oauthUrlRouter };
