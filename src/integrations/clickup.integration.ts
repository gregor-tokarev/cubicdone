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
  async fetchTeams(): Promise<any[] | void> {
    const { teams } = await this.fetch("/team");

    this.teams = teams;

    return teams;
  }

  spaces: any[] = [];
  async fetchSpaces(): Promise<any[] | void> {
    if (!this.teams.length) return;

    const spaces = await this.makeGroupCall(
      this.teams.map((t) => this.fetch(`/team/${t.id}/space?archived=false`)),
      "spaces",
    );

    this.spaces = spaces;

    return spaces;
  }

  folders: any[] = [];
  async fetchFolders(): Promise<any[] | void> {
    if (!this.spaces.length) return;

    const folders = await this.makeGroupCall(
      this.spaces.map((t) =>
        this.fetch(`/space/${t.id}/folder?archived=false`),
      ),
      "folders",
    );

    this.folders = folders;

    return folders;
  }

  lists: any[] = [];
  async fetchLists(): Promise<any[] | void> {
    if (!this.folders.length) return;

    const lists = await this.makeGroupCall(
      this.folders.map((t) =>
        this.fetch(`/folder/${t.id}/list?archived=false`),
      ),
      "lists",
    );

    this.lists = lists;

    return lists;
  }

  async getMyId(): Promise<string> {
    const { user } = await this.fetch("/user");
    return user.id;
  }

  async fetch(url: string) {
    if (!this.apiKey) throw new Error("No api key");

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

  async makeGroupCall(
    promises: Promise<any>[],
    upField: string,
  ): Promise<any[]> {
    const results = await Promise.allSettled(promises);

    return (
      results
        .filter((r) => r.status === "fulfilled" && r.value)
        .filter((r) => "value" in r)
        // @ts-ignore
        .filter((r) => !("err" in r.value))
        // @ts-ignore
        .map((r) => r.value)
        .map((r) => r[upField])
        .flat()
    );
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

    const tasks = await this.makeGroupCall(
      this.lists.map((t) => this.fetch(`/list/${t.id}/task?${query}`)),
      "tasks",
    );

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
      this.apiKey = apiKey;
      const data = await this.fetch("/user");

      return "user" in data;
    } catch (e) {
      return false;
    }
  }
}
