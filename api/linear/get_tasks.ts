import { VercelRequest, VercelResponse } from "@vercel/node";
import { LinearClient } from "@linear/sdk";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  const linear = new LinearClient({
    apiKey: request.query["apiKey"],
  });

  const me = await linear.viewer;
  const tasks = me.assignedIssues();
  const projects = linear.projects();
  const status = linear.workflowStates();
  const res = await Promise.all([tasks, projects, status]);

  return response.status(200).json(res);
}
