import { Google, Linear, Notion } from "arctic";
import { config } from "dotenv";

config({ path: ".env.local" });

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID ?? "",
  process.env.GOOGLE_SECRET ?? "",
  "https://api.cubicdone.com/oauth/redirect/google",
  // "http://localhost:4000/oauth/redirect/google",
);

export const notion = new Notion(
  process.env.NOTION_CLIENT_ID ?? "",
  process.env.NOTION_SECRET ?? "",
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000/oauth/redirect/notion"
    : "https://api.cubicdone.com/oauth/redirect/notion",
);

export const linear = new Linear(
  process.env.LINEAR_CLINET_ID ?? "",
  process.env.LINEAR_SECRET ?? "",
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000/oauth/redirect/linear"
    : "https://api.cubicdone.com/oauth/redirect/linear",
);
