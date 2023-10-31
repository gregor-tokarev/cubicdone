export type Task = {
  id: string;
  draftId: string;
  title: string;
  status: "todo" | "done";
  order: number;
  dateCreated: string;
  dateUpdated: string;
  dateCommitted: string;
  dateCompleted: string | null;
  dateTodo: string;
  projectId: string | null;
  external?: {
    integrationName: string;
    projectTitle: string;
    projectId: string;
    link: string;
    iconURL: string;
  };
};
