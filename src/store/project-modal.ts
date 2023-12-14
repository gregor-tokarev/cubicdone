import { defineStore } from "pinia";
import { Project } from "@models/project.model.ts";
import { Draft } from "@models/draft.model.ts";

interface ProjectModalOptions {
  draft: Draft;
}

interface Fn {
  (value: string): void;
}

export const useProjectModalStore = defineStore("projectModal", {
  state: () => ({
    resolveFn: null as null | Fn,
    modalOptions: null as ProjectModalOptions | null,
    open: false,
  }),
  actions: {
    use(options: ProjectModalOptions): Promise<Project["id"]> {
      this.open = true;

      return new Promise((resolve) => {
        this.resolveFn = resolve;
        this.modalOptions = options;
      });
    },
    close() {
      this.resolveFn = null;
      this.modalOptions = null;
      this.open = false;
    },
  },
});
