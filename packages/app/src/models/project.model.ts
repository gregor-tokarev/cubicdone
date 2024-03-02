export interface Project {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface ProjectStatistic {
  project: Project;
  draftCount: number;
  taskCompletedCount: number;
  taskActiveCount: number;
}
