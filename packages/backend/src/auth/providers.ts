import { Google } from "arctic";
import { config } from "dotenv";

config({ path: ".env.local" });

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID ?? "",
  process.env.GOOGLE_SECRET ?? "",
  "https://api.cubicdone.com/oauth/redirect/google",
  // "http://localhost:4000/oauth/redirect/google",
);
