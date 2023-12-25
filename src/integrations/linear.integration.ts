import {
  Integration,
  IntegrationProject,
  IntegrationTask,
} from "@models/integration.model.ts";
import { Issue, ProjectConnection } from "@linear/sdk";

export class LinearIntegration implements Integration {
  name = "linear";
  description =
    "Linear is a better way to build products\nMeet the new standard for modern software development.Streamline issues, sprints, and product roadmaps.";
  iconURL = "/img/integrations/linear.svg";

  constructor(public id: string) {}

  async checkToken(apiKey: string): Promise<boolean> {
    try {
      const { ok } = await fetch(`/api/linear/check_token`, {
        headers: { Authorization: apiKey },
      }).then((r) => r.json());

      return ok;
    } catch (e) {
      return false;
    }
  }

  projectsCache: IntegrationProject[] = [];
  apiKeys: string[] = [];

  async fetchProjects(): Promise<IntegrationProject[]> {
    if (!this.apiKeys.length) throw new Error(`${this.name} apiKey is missing`);

    const req = this.apiKeys.map((apiKey) =>
      fetch(`/api/linear/get_projects`, {
        headers: { Authorization: apiKey },
      }).then((r) => r.json()),
    );
    const res: ProjectConnection[] = await Promise.all(req);

    const projects = res.map((r) => r.nodes).flat();
    this.projectsCache = projects;

    return projects.map((p) => ({ name: p.name, id: p.id }));
  }

  async fetchTasks(): Promise<IntegrationTask[]> {
    if (!this.apiKeys.length) throw new Error(`${this.name} apiKey is missing`);

    let fetches: Promise<any>[] = [];

    console.log(this.apiKeys);
    const req = this.apiKeys.map((apiKey) => {
      console.log(apiKey);
      return fetch(`/api/linear/get_tasks`, {
        headers: { Authorization: apiKey },
      }).then((r) => r.json());
    });
    fetches = fetches.concat(req);

    if (!this.projectsCache.length) {
      fetches.push(this.fetchProjects());
    }

    const [tasks] = await Promise.all(fetches);

    return tasks
      .map((r) => r.nodes)
      .flat()
      .map((t: Issue) => {
        // @ts-ignore
        const project = this.projectsCache.find((p) => p.id === t._project?.id);
        return {
          id: t.id,
          title: t.title,
          createdAt: t.createdAt as unknown as string,
          updatedAt: t.updatedAt as unknown as string,
          link: t.url,
          iconURL: this.iconURL,
          integrationName: this.name,
          projectTitle: project?.name ?? "",
          projectId: project?.id ?? "",
        };
      });
  }
}
