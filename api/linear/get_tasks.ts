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
    filter: { state: { name: { in: ["In Progress", "Todo", "Backlog"] } } },
  });

  return response.status(200).json(tasks.nodes);
}
