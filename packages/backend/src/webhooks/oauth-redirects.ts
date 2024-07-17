import { NotionTokens } from "arctic";
import { config } from "dotenv";
import { eq, InferSelectModel } from "drizzle-orm";
import { NextFunction, Request, Response, Router } from "express";
import { lucia, stateCookieName, verifierCookieName } from "../auth/lucia";
import { google, linear } from "../auth/providers";
import { db } from "../db";
import { userTable } from "../models/schema";

config({ path: ".env.local" });

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
    console.log(user)
    const session = await lucia.createSession(user.id, {});
    console.log(session)

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
    console.log(code, codeVerifier)

    const tokens = await google.validateAuthorizationCode(
        code as string,
        codeVerifier,
    );

    console.log(tokens);

    const response = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        },
    );
    const user = await response.json();
    console.log(user)

    const [existingUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, user["email"]))
        .execute();

    console.log(existingUser)

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

    const tokens: NotionTokens = await fetch(
        "https://api.notion.com/v1/oauth/token",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.NOTION_SECRET}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_url: "http://localhost:4000/oauth/redirect/notion",
            }),
        },
    ).then((res) => res.json());

    console.log(tokens);

    const user = await fetch("https://api.notion.com/v1/users/me", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    }).then((res) => res.json());
    console.log(user);
});

oauthRedirectRouter.get("/linear", async (req, res) => {
    const code = req.query["code"];

    const tokens = await linear.validateAuthorizationCode(code as string);

    const userData = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        body: `{ "query": "{ viewer { id name email avatarUrl } }" }`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    }).then((res) => res.json());

    const user = userData.data.viewer;
    const [firstName, lastName] = user["name"];

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
            firstName,
            lastName,
            avatar: user["avatarUrl"],
        })
        .returning();

    return defaultResponse(newUser, res);
});

export { oauthRedirectRouter };
