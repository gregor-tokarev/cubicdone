import { IntegrationTask } from "@models/integration.model.ts";
import { Draft } from "@models/draft.model.ts";
import { Task } from "@models/task.model.ts";

export function draftsFromIntegration(
  integrationTasks: IntegrationTask[],
  maxDraftOrder: number,
  tasks: Task[],
): Draft[] {
  const drafts = integrationTasks.map((it, idx) => ({
    id: it.id,
    title: it.title,
    projectId: null,
    dateCreated: it.createdAt,
    dateUpdated: it.updatedAt,
    order: maxDraftOrder + 1 + idx,
    external: {
      integrationName: it.integrationName,
      projectTitle: it.projectTitle,
      projectId: it.projectId,
      iconURL: it.iconURL,
      link: it.link,
    },
  })) satisfies Draft[];

  const taskIds = tasks.map((t) => t.draftId);

  return drafts.filter((d) => taskIds.indexOf(d.id) === -1);
}
