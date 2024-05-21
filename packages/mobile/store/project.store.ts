import { create } from "zustand";
import { Project } from "contract-models";

export const useProjectStore = create((set, get) => ({
  projects: [],
  setProjects(projects: Project[]) {
    set({ projects });
  },
}));
