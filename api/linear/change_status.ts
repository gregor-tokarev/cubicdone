import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: request.headers["authorization"],
  });

  const body = JSON.parse(request.body);
  const issueId = body["taskId"] as string;
  const state = body["status"] as "Todo" | "Done";

  const states = await linear.workflowStates();
  const selectedState = states.nodes.find((s) => s.name === state);

  const issue = await linear.issue(issueId);
  await issue.update({ stateId: selectedState.id });

  return response.status(200).json(issue);
}
