import {
  Integration,
  IntegrationProject,
  IntegrationTask,
} from "@models/integration.model.ts";

export class ClickupIntegration implements Integration {
  name = "clickup";
  description =
    "Shockingly simple and more powerful than ever before — ClickUp 3.0 redefines productivity (again). Get started now to experience the future of work.";
  iconURL = "https://clickup.com/images/brand-assets/logo-symbol-color.svg";
  apiKey?: string;

  apiBase = "https://api.clickup.com/api/v2";

  async fetchProjects(): Promise<IntegrationProject[]> {
    return [];
  }

  teams: any[] = [];
  async fetchTeams(): Promise<any[]> {
    const { teams } = await this.fetch("/team");

    this.teams = teams;

    return teams;
  }

  spaces: any[] = [];
  async fetchSpaces(): Promise<any[]> {
    if (!this.teams.length) return;

    const spaces = (
      await Promise.allSettled(
        this.teams.map((t) => this.fetch(`/team/${t.id}/space?archived=false`)),
      )
    )
      .filter((r) => r.status === "fulfilled")
      .filter((r) => !("err" in r.value))
      .map((r) => r.value)
      .map((r) => r.spaces);

    const flatSpaces = spaces.flat();
    this.spaces = flatSpaces;

    return flatSpaces;
  }

  folders: any[] = [];
  async fetchFolders(): Promise<any[]> {
    if (!this.spaces.length) return;

    const folders = (
      await Promise.allSettled(
        this.spaces.map((t) =>
          this.fetch(`/space/${t.id}/folder?archived=false`),
        ),
      )
    )
      .filter((r) => r.status === "fulfilled")
      .filter((r) => !("err" in r.value))
      .map((r) => r.value)
      .map((r) => r.folders);

    const flatFolders = folders.flat();
    this.folders = flatFolders;

    return flatFolders;
  }

  lists: any[] = [];
  async fetchLists(): Promise<any[]> {
    if (!this.folders.length) return;

    const lists = (
      await Promise.allSettled(
        this.folders.map((t) =>
          this.fetch(`/folder/${t.id}/list?archived=false`),
        ),
      )
    )
      .filter((r) => r.status === "fulfilled")
      .filter((r) => !("err" in r.value))
      .map((r) => r.value)
      .map((r) => r.lists);

    const flatLists = lists.flat();
    this.lists = flatLists;

    return flatLists;
  }

  async getMyId(): Promise<string> {
    const { user } = await this.fetch("/user");
    return user.id;
  }

  async fetch(url: string) {
    return fetch(`${this.apiBase}${url}`, {
      method: "GET",
      headers: {
        Authorization: this.apiKey,
      },
    })
      .then((r) => r.json())
      .catch((err) => {
        throw new Error(err);
      });
  }

  async fetchTasks(): Promise<IntegrationTask[]> {
    await this.fetchTeams();
    await this.fetchSpaces();
    await this.fetchFolders();
    await this.fetchLists();

    if (!this.lists.length) return [];

    const userId = await this.getMyId();

    const query = new URLSearchParams({
      archived: "false",
      include_markdown_description: "false",
      subtasks: "false",
      include_closed: "false",
      "assignees[]": userId,
    }).toString();

    const tasks = (
      await Promise.allSettled(
        this.lists.map((t) => this.fetch(`/list/${t.id}/task?${query}`)),
      )
    )
      .filter((r) => r.status === "fulfilled")
      .filter((r) => !("err" in r.value))
      .map((r) => r.value)
      .map((r) => r.tasks);

    return tasks.flat().map((t) => ({
      id: t.id,
      title: t.name,
      integrationName: this.name,
      createdAt: t.date_created,
      updatedAt: t.date_updated,
      iconURL: this.iconURL,
      link: t.url,
    }));
  }

  async checkToken(apiKey: any): Promise<boolean> {
    try {
      const data = this.fetch("/user");

      return "user" in data;
    } catch (e) {
      return false;
    }
  }
}
