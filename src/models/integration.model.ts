export interface IntegrationItem {
  id: number;
  name: string;
  description: string;
  iconURL: string;
}

export interface IntegrationTask {}

export interface Integration {
  name: string;
  description: string;
  iconURL: string;
  apiKey?: string;

  checkToken(apiKey: any): Promise<boolean>;
  // fetchTasks(): Promise<IntegrationTask>;
  fetchProjects(): Promise<string[]>;
  // getToken(): string;
}

export class LinearIntegration implements Integration {
  name = "linear";
  description =
    "Linear is a better way to build products\nMeet the new standard for modern software development.Streamline issues, sprints, and product roadmaps.";
  iconURL = "/img/integrations/linear.svg";
  apiKey?: string;

  async checkToken(apiKey: string): Promise<boolean> {
    try {
      await fetch(`/api/linear/check_token?apiKey=${apiKey}`);

      return true;
    } catch (e) {
      return false;
    }
  }

  async fetchProjects(): Promise<string[]> {
    return [];
  }
}
