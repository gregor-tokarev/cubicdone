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
  state: Task["status"];
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
