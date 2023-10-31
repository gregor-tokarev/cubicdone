import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: request.headers["authorization"],
  });

  try {
    const me = await linear.viewer;

    return response.status(200).json({ ok: "id" in me });
  } catch (err) {
    return response.status(200).send({ ok: false });
  }
}
