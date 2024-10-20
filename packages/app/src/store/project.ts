import { Project, projectStore } from "@models/project.model.ts";

import { randomInt } from "@utils/random.ts";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { defineStore } from "pinia";
import { useIdbxConnectionManager } from "vue-sync-client";
import { trpc } from "../main.ts";
import { useDraftsStore } from "./drafts.ts";
import { useProjectStatusStore } from "./project-status.ts";
import { useTaskStore } from "./task.ts";

dayjs.extend(minMax);

export const useProjectStore = defineStore("project", {
    state: () => ({
        projects: [] as Project[],
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
        async loadProjects() {
            const connectionManager = await useIdbxConnectionManager();
            this.projects = await connectionManager.getItems(projectStore);
        },
        async backwardSync() {
            const projects = await trpc.project.getAll.query();

            const connectionManager = await useIdbxConnectionManager();
            await connectionManager.backwardSync(projectStore, projects);
            this.projects = await connectionManager.getItems(projectStore);
        },
        async create(title: string): Promise<Project> {
            const projectStatusStore = useProjectStatusStore();

            const proj: Project = {
                id: nanoid(4),
                color: this.colors[randomInt(0, this.colors.length)],
                title,
                order: 0,
                statusId: projectStatusStore.defaultStatusId,
            };

            const connectionManager = await useIdbxConnectionManager();

            this.projects.forEach((p) => {
                connectionManager.putItem(projectStore, { ...p, order: p.order + 1 });
                p.order++;
            });

            connectionManager.putItem(projectStore, proj);
            this.projects.push(proj);

            return proj;
        },
        async edit(id: string, project: Partial<Project>): Promise<Project> {
            const pIdx = this.projects.findIndex((p) => p.id === id);

            this.projects.splice(pIdx, 1, { ...this.projects[pIdx], ...project });

            const connectionManager = await useIdbxConnectionManager();
            connectionManager.putItem(projectStore, this.projects[pIdx]);

            return this.projects[pIdx];
        },
        async remove(projectId: string | string[]) {
            const connectionManager = await useIdbxConnectionManager();
            connectionManager.deleteItem(projectStore, projectId);

            const draftStore = useDraftsStore();
            const taskStore = useTaskStore();

            if (typeof projectId === "string") {
                const projectIdx = this.projects.findIndex((p) => p.id === projectId);

                this.projects.splice(projectIdx, 1);

                draftStore.clearProject(projectId);
                taskStore.clearProject(projectId);
            } else if (Array.isArray(projectId)) {
                this.projects = this.projects.filter((p) => {
                    if (projectId.includes(p.id)) {
                        draftStore.clearProject(p.id);
                        taskStore.clearProject(p.id);

                        return false;
                    }

                    return true;
                });
            }
        },
    },
    getters: {
        getStatus(_state) {
            const projectStatusStore = useProjectStatusStore();

            return (projectId: string) => {
                const project = this.getOne(projectId);
                if (!project || !project.statusId) return;

                return projectStatusStore.getOne(project.statusId);
            };
        },
        activeProjects(state) {
            return state.projects.filter((p) => {
                const status = this.getStatus(p.id);
                return status?.title !== "finished";
            });
        },
        rankedProjects(state): Project[] {
            const draftStore = useDraftsStore();

            // key - projectId
            // value - date of most recent draft with this project
            const recentTable: Record<string, string | undefined> = {};

            this.activeProjects.forEach((p) => {
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
        sortedProjects(state): Project[] {
            return state.projects.sort((prev, next) => prev["order"] - next["order"]);
        },
        getIndex(): Fuse<Project> {
            return new Fuse<Project>(this.activeProjects, {
                keys: [{ name: "title" }],
            });
        },
        getOne(state) {
            return (id: string): Project | undefined => {
                return state.projects.find((p) => p.id === id);
            };
        },
        maxOrder(state): number {
            return Math.max(...state.projects.map((p) => p.order));
        },
    },
});
