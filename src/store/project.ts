import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { Project } from "../models/project.model.ts";
import { randomInt } from "../utils/random.ts";
import { nanoid } from "nanoid";
import Fuse from "fuse.js";

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
