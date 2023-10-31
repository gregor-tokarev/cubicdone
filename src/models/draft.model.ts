export interface Draft {
  id: string;
  title: string;
  dateCreated: string;
  dateUpdated: string;
  order: number;
  projectId: string | null;
  external?: {
    integrationName: string;
    projectTitle: string;
    projectId: string;
    link: string;
    iconURL: string;
  };
}
