import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: request.query["apiKey"],
  });

  const v = await linear.viewer;

  return response.status(200).json(v);
}
