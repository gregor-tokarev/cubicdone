import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: request.headers["authorization"],
  });

  const me = await linear.viewer;
  const tasks = await me.assignedIssues({
    includeArchived: false,
  });
  const states = await Promise.all(tasks.nodes.map((t) => t.state));

  return response
    .status(200)
    .json(tasks.nodes.map((t, idx) => ({ ...t, state: states[idx] })));
}
