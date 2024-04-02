import { defineStore } from "pinia";
import {
  ProjectStatus,
  projectStatusStore,
} from "@models/projectStauts.model.ts";
import { trpc } from "../main.ts";
import { useIdbxConnectionManager } from "vue-sync-client/src";
import Fuse from "fuse.js";

export const useProjectStatusStore = defineStore("projectStatus", {
  state: () => ({
    projectStatuses: [] as ProjectStatus[],
  }),
  actions: {
    async loadProjects() {
      const connectionManager = await useIdbxConnectionManager();
      this.projectStatuses =
        await connectionManager.getItems(projectStatusStore);
    },
    async backwardSync() {
      const projects = await trpc.projectStatus.getAll.query();

      const connectionManager = await useIdbxConnectionManager();
      await connectionManager.backwardSync(projectStatusStore, projects);
      this.projectStatuses =
        await connectionManager.getItems(projectStatusStore);
    },
  },
  getters: {
    getIndex(state): Fuse<ProjectStatus> {
      return new Fuse<ProjectStatus>(state.projectStatuses, {
        keys: [{ name: "title" }],
      });
    },
    defaultStatusId(state): string | null {
      return (
        state.projectStatuses.find((ps) => ps.title === "not started")?.id ??
        null
      );
    },
  },
});
