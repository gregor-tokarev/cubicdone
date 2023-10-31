import { Issue, ProjectConnection } from "@linear/sdk";
import { Task } from "@models/task.model.ts";

export interface IntegrationTask {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  link: string;
  iconURL: string;
  integrationName: string;
  projectTitle: string;
  projectId: string;
}

export interface IntegrationProject {
  id: string;
  name: string;
}

export interface Integration {
  name: string;
  description: string;
  iconURL: string;
  apiKey?: string;

  checkToken(apiKey: any): Promise<boolean>;
  fetchTasks(): Promise<IntegrationTask[]>;
  fetchProjects(): Promise<IntegrationProject[]>;
  changeStatus(id: string, status: Task["status"]): Promise<void>;
}

export class LinearIntegration implements Integration {
  name = "linear";
  description =
    "Linear is a better way to build products\nMeet the new standard for modern software development.Streamline issues, sprints, and product roadmaps.";
  iconURL = "/img/integrations/linear.svg";
  apiKey?: string;

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
  async fetchProjects(): Promise<IntegrationProject[]> {
    if (!this.apiKey) throw new Error(`${this.name} apiKey is missing`);

    const req = await fetch(`/api/linear/get_projects`, {
      headers: { Authorization: this.apiKey },
    });
    const res: ProjectConnection = await req.json();

    this.projectsCache = res.nodes;

    return res.nodes.map((p) => ({ name: p.name, id: p.id }));
  }

  async fetchTasks(): Promise<IntegrationTask[]> {
    if (!this.apiKey) throw new Error(`${this.name} apiKey is missing`);

    const fetches: Promise<any>[] = [];

    const req = fetch(`/api/linear/get_tasks`, {
      headers: { Authorization: this.apiKey },
    });
    fetches.push(req.then((r) => r.json()));

    if (!this.projectsCache.length) {
      fetches.push(this.fetchProjects());
    }

    const [tasks] = await Promise.all(fetches);

    return tasks.nodes.map((t: Issue) => {
      // @ts-ignore
      const project = this.projectsCache.find((p) => p.id === t._project.id);
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

  async changeStatus(id: string, status: Task["status"]): Promise<void> {
    if (!this.apiKey) throw new Error(`${this.name} apiKey is missing`);

    await fetch("/api/linear/change_status", {
      headers: { Authorization: this.apiKey },
      method: "POST",
      body: JSON.stringify({
        taskId: id,
        status: status === "todo" ? "Todo" : "Done",
      }),
    }).then((r) => r.json());
  }
}
