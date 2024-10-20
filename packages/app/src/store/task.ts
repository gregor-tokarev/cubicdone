import { defineStore } from "pinia";
import { Task, taskStore } from "@models/task.model.ts";
import { useDraftsStore } from "./drafts.ts";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Draft } from "@models/draft.model.ts";
import { trpc } from "../main.ts";
import { useIdbxConnectionManager } from "vue-sync-client";

export const useTaskStore = defineStore("task", {
    state: () => ({
        tasks: [] as Task[],
    }),
    actions: {
        async loadTasks() {
            const connectionManager = await useIdbxConnectionManager();
            this.tasks = await connectionManager.getItems(taskStore);
        },

        async backwardSync() {
            const tasks = await trpc.task.getAll.query({
                date: dayjs().format(),
                lastNDays: 30,
            });

            const connectionManager = await useIdbxConnectionManager();
            await connectionManager.backwardSync(taskStore, tasks as Task[]);
            this.tasks = await connectionManager.getItems(taskStore);
        },
        async paginateOver(date: string) {
            const tasks = await trpc.task.getAll.query({
                date,
                lastNDays: 30,
            });

            const tasksUnion = JSON.parse(JSON.stringify([...tasks, ...this.tasks]));

            const connectionManager = await useIdbxConnectionManager();
            await connectionManager.backwardSync(taskStore, tasksUnion as Task[]);
            this.tasks = await connectionManager.getItems(taskStore);
        },
        async commitDraft(
            draftId: string,
            dateTodo: string,
            newIdx: number,
        ): Promise<Task | undefined> {
            const draftStore = useDraftsStore();

            const draft = draftStore.getOne(draftId);
            if (!draft) return;

            const task: Task = {
                id: nanoid(3),
                draftId: draft.id,
                title: draft.title,
                status: "todo",
                dateUpdated: draft.dateUpdated,
                dateCreated: draft.dateCreated,
                dateCommitted: dayjs().toISOString(),
                dateCompleted: null,
                order: newIdx,
                dateTodo,
                projectId: draft.projectId,
                external: null,
            };

            const connectionManager = await useIdbxConnectionManager();
            connectionManager.putItem(taskStore, task);

            this.tasks.push(task);
            await this.setOrder(task.id, task.dateTodo, newIdx); // needed to change other tasks order

            await draftStore.remove(draftId);
        },
        async commitIntegration(
            draft: Draft,
            dateTodo: string,
            newIdx: number,
        ): Promise<Task> {
            const task: Task = {
                id: nanoid(3),
                draftId: draft.id,
                title: draft.title,
                status: "todo",
                dateUpdated: draft.dateUpdated,
                dateCreated: draft.dateCreated,
                dateCommitted: dayjs().toISOString(),
                dateCompleted: null,
                order: newIdx,
                dateTodo,
                projectId: draft.projectId,
                external: JSON.parse(JSON.stringify(draft.external)),
            };

            const connectionManager = await useIdbxConnectionManager();
            connectionManager.putItem(taskStore, task);

            this.tasks.push(task);
            await this.setOrder(task.id, task.dateTodo, newIdx); // needed to change other tasks order

            return task;
        },
        async setOrder(
            taskId: string,
            date: string,
            order: number,
        ): Promise<Task | undefined> {
            const task = this.tasks.find((t) => t.id === taskId);
            if (!task) return;

            task.order = order;

            const connectionManager = await useIdbxConnectionManager();

            this.getByDate(date)
                .filter((t) => t.order >= order && t.id !== taskId)
                .forEach((t) => {
                    connectionManager.putItem(taskStore, { ...t, order: t.order + 1 });
                    t.order++;
                });

            return task;
        },

        clearProject(projectId: string) {
            const ids = this.tasks
                .filter((d) => d.projectId === projectId)
                .map((d) => d.id);

            ids.forEach((id) => {
                this.update(id, { projectId: null });
            });
        },
        async setProject(taskId: string | string[], projectId: string | null) {
            const connectionManager = await useIdbxConnectionManager();

            if (Array.isArray(taskId)) {
                this.tasks
                    .filter((t) => taskId.includes(t.id))
                    .forEach((t) => {
                        t.projectId = projectId;
                        connectionManager.putItem(taskStore, { ...t, projectId });
                    });

                return;
            }
            const task = this.getOne(taskId);
            if (!task) return;

            task.projectId = projectId;
            connectionManager.putItem(taskStore, { ...task, projectId });
        },
        async changeOrder(
            taskId: string,
            oldIdx: number,
            newIdx: number,
        ): Promise<Task | undefined> {
            const task = this.tasks.find((t) => t.id === taskId);
            if (!task) return;

            const dateTasks = this.getByDate(task.dateTodo);

            const connectionManager = await useIdbxConnectionManager();

            if (oldIdx > newIdx) {
                const targetTasks = dateTasks.filter(
                    (t) => t.order >= newIdx && t.order < oldIdx && t.id !== taskId,
                );
                targetTasks.forEach((t) => {
                    connectionManager.putItem(
                        taskStore,
                        JSON.parse(JSON.stringify({ ...t, order: t.order + 1 })),
                    );
                    t.order++;
                });
            } else if (oldIdx < newIdx) {
                const targetTasks = dateTasks.filter(
                    (t) => t.order <= newIdx && t.order > oldIdx && t.id !== taskId,
                );
                targetTasks.forEach((t) => {
                    connectionManager.putItem(
                        taskStore,
                        JSON.parse(JSON.stringify({ ...t, order: t.order - 1 })),
                    );
                    t.order--;
                });
            }

            task.order = newIdx;
            connectionManager.putItem(taskStore, JSON.parse(JSON.stringify(task)));

            return task;
        },
        async changeTodoDate(
            taskId: string,
            newDate: string,
            newIdx: number,
        ): Promise<Task | undefined> {
            const taskIdx = this.tasks.findIndex((t) => t.id === taskId);

            const connectionManager = await useIdbxConnectionManager();

            const oldDateTasks = this.tasks.filter((t) =>
                dayjs(t.dateTodo).isSame(this.tasks[taskIdx].dateTodo, "day"),
            );
            oldDateTasks
                .filter((t) => t.order > this.tasks[taskIdx].order)
                .forEach((t) => {
                    connectionManager.putItem(taskStore, { ...t, order: t.order - 1 });
                    t.order--;
                });

            this.tasks[taskIdx].dateTodo = newDate;
            connectionManager.putItem(
                taskStore,
                JSON.parse(JSON.stringify(this.tasks[taskIdx])),
            );

            await this.setOrder(taskId, newDate, newIdx);

            return this.tasks[taskIdx];
        },
        async update(taskId: string, newTask: Partial<Task>) {
            const taskIdx = this.tasks.findIndex((t) => t.id === taskId);
            this.tasks.splice(taskIdx, 1, { ...this.tasks[taskIdx], ...newTask });

            const connectionManager = await useIdbxConnectionManager();
            connectionManager.putItem(
                taskStore,
                JSON.parse(JSON.stringify(this.tasks[taskIdx])),
            );
        },
        // async updateFromIntegrations(draft: IntegrationTask[]) {
        //   const connectionManager = await useIdbxConnectionManager();
        //
        //   draft.forEach((d) => {
        //     const taskIdx = this.tasks.findIndex((t) => t.draftId === d.id);
        //
        //     const task: Task = {
        //       id: nanoid(3),
        //       draftId: d.id,
        //       title: d.title,
        //       status: this.tasks[taskIdx].status,
        //       dateUpdated: d.updatedAt,
        //       dateCreated: d.createdAt,
        //       dateCommitted: dayjs().toISOString(),
        //       dateCompleted: null,
        //       order: this.tasks[taskIdx].order,
        //       dateTodo: this.tasks[taskIdx].dateTodo,
        //       projectId: null,
        //       external: {
        //         integrationName: d.integrationName,
        //         projectTitle: d.projectTitle,
        //         projectId: d.projectId,
        //         iconURL: d.iconURL,
        //         link: d.link,
        //       },
        //     };
        //
        //     connectionManager.putItem(taskStore, task);
        //     this.tasks.splice(taskIdx, 1, task);
        //   });
        // },
        async remove(id: Task['id'] | Task['id'][]) {
            const connectionManager = await useIdbxConnectionManager();
            connectionManager.deleteItem(taskStore, id);

            if (typeof id === "string") {
                const taskIdx = this.tasks.findIndex((t) => t.id === id);
                // this.descOrders(id);

                this.tasks.splice(taskIdx, 1);
            } else if (Array.isArray(id)) {
                this.tasks = this.tasks.filter((d) => {
                    if (id.includes(d.id)) {
                        // this.descOrders(d.id);
                        return false;
                    }

                    return true;
                });
            }
        },
    },
    getters: {
        getByDate(state) {
            return (date: string): Task[] => {
                const searchedDate = dayjs(date);

                return state.tasks
                    .filter((t) => {
                        return dayjs(t.dateTodo).isSame(searchedDate, "day");
                    })
                    .sort((prev, next) => prev.order - next.order);
            };
        },
        getByProject(state) {
            return (projectId: string): Task[] => {
                return state.tasks.filter((t) => t.projectId === projectId);
            };
        },
        getOne(state) {
            return (taskId: string): Task | undefined => {
                return state.tasks.find((t) => t.id === taskId);
            };
        },
    },
});
