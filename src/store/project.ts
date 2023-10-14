import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { Project } from "../models/project.model.ts";
import { randomInt } from "../utils/random.ts";
import { nanoid } from "nanoid";
import Fuse from "fuse.js";
import { useDraftsStore } from "./drafts.ts";
import minMax from "dayjs/plugin/minMax";
import dayjs from "dayjs";

dayjs.extend(minMax);

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: useLocalStorage<Project[]>("projects", []),
    colors: [
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ],
  }),
  actions: {
    create(title: string): Project {
      const proj: Project = {
        id: nanoid(4),
        color: this.colors[randomInt(0, this.colors.length)],
        title,
      };

      this.projects.push(proj);

      return proj;
    },
  },
  getters: {
    rankedProjects(state): Project[] {
      const draftStore = useDraftsStore();

      // key - projectId
      // value - date of most recent draft with this project
      const recentTable: Record<string, string | undefined> = {};

      state.projects.forEach((p) => {
        const drafts = draftStore.getByProject(p.id);
        recentTable[p.id] = dayjs
          .max(...drafts.map((d) => dayjs(d.dateCreated)))
          ?.toISOString();
      });

      return Object.entries(recentTable)
        .sort((prev, next) => {
          if (!prev[1] && !next[1]) return 0;
          else if (!prev[1] && next[1]) return 1;
          else if (prev[1] && !next[1]) return -1;
          else return dayjs(next[1]).diff(prev[1], "milliseconds");
        })
        .map(([projectId]) => {
          return this.getOne(projectId);
        })
        .filter(Boolean) as Project[];
    },
    getIndex(state): Fuse<Project> {
      return new Fuse<Project>(state.projects, {
        keys: [{ name: "title" }],
      });
    },
    getOne(state) {
      return (id: string): Project | undefined => {
        return state.projects.find((p) => p.id === id);
      };
    },
  },
});
