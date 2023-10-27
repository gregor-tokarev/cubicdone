import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: "lin_api_k7Hk0QrBjwdTyzBAEHwW1SyTR33ycZoZHu3eHfGU",
  });

  const v = await linear.viewer;
  const tasks = await v.teams();

  return response.status(200).json(tasks);
}
