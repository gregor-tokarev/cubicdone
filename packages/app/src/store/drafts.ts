import { defineStore } from "pinia";
import { Draft, draftStore } from "@models/draft.model.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { trpc } from "../main.ts";
import { useIdbxConnectionManager } from "vue-sync-client";
import { useTaskStore } from "@store/task.ts";

export const useDraftsStore = defineStore("drafts", {
  state: () => ({
    drafts: [] as Draft[],
  }),
  actions: {
    async revertFromTask(taskId: string, order: number) {
      const taskStore = useTaskStore();

      const task = taskStore.getOne(taskId);
      if (!task) return;

      console.log(task);
      const draft: Draft = {
        id: task.draftId,
        dateCreated: task.dateCreated,
        dateUpdated: task.dateUpdated,
        title: task.title,
        projectId: task.projectId,
        order: order,
        external: task.external,
      };
      console.log(draft);

      const connectionManager = await useIdbxConnectionManager();
      connectionManager.putItem(draftStore, draft);
      this.drafts.push(draft);

      await this.setOrder(draft.id, order);

      await taskStore.remove(taskId);

      return draft;
    },
    async loadDrafts() {
      const connectionManager = await useIdbxConnectionManager();
      this.drafts = await connectionManager.getItems(draftStore);
    },
    async backwardSync() {
      const drafts = await trpc.draft.getAll.query();

      await new Promise((r) => setTimeout(r, 20000));

      const connectionManager = await useIdbxConnectionManager();
      await connectionManager.backwardSync(draftStore, drafts);
      this.drafts = await connectionManager.getItems(draftStore);
    },
    async create(title: string, projectId: string | null): Promise<Draft> {
      const draft: Draft = {
        id: nanoid(3),
        dateCreated: dayjs().toISOString(),
        dateUpdated: dayjs().toISOString(),
        order: this.maxOrder + 1,
        projectId,
        title,
      };

      const connectionManager = await useIdbxConnectionManager();
      connectionManager.putItem(draftStore, draft);
      this.drafts.push(draft);

      return draft;
    },
    async edit(id: string, title: string): Promise<Draft | undefined> {
      const draft = this.drafts.find((d) => d.id === id);
      if (!draft) return;

      draft.title = title;
      draft.dateUpdated = dayjs().toISOString();

      const connectionManager = await useIdbxConnectionManager();
      connectionManager.putItem(draftStore, draft);
    },
    async remove(id: string | string[]): Promise<void> {
      const connectionManager = await useIdbxConnectionManager();
      connectionManager.deleteItem(draftStore, id);

      if (typeof id === "string") {
        const draftIdx = this.drafts.findIndex((d) => d.id === id);
        this.descOrders(id);

        this.drafts.splice(draftIdx, 1);
      } else if (Array.isArray(id)) {
        this.drafts = this.drafts.filter((d) => {
          if (id.includes(d.id)) {
            this.descOrders(d.id);
            return false;
          }

          return true;
        });
      }
    },
    async setOrder(draftId: string, order: number): Promise<Draft | undefined> {
      const draft = this.drafts.find((t) => t.id === draftId);
      if (!draft) return;

      draft.order = order;

      const connectionManager = await useIdbxConnectionManager();

      this.drafts
        .filter((d) => d.order >= order && d.id !== draftId)
        .forEach((d) => {
          connectionManager.putItem(draftStore, { ...d, order: d.order + 1 });
          d.order++;
        });

      return draft;
    },
    async descOrders(draftId: string) {
      const draft = this.getOne(draftId);
      if (!draft) return;

      const connectionManager = await useIdbxConnectionManager();

      this.drafts
        .filter((d) => d.order >= draft.order && d.id !== draftId)
        .forEach((d) => {
          connectionManager.putItem(draftStore, { ...d, order: d.order - 1 });
          d.order--;
        });
    },
    async changeOrder(
      draftId: string,
      oldIdx: number,
      newIdx: number,
    ): Promise<Draft | undefined> {
      const draft = this.getOne(draftId);
      if (!draft) return;

      const connectionManager = await useIdbxConnectionManager();

      if (oldIdx > newIdx) {
        const targetDrafts = this.drafts.filter(
          (t) => t.order >= newIdx && t.order < oldIdx && t.id !== draftId,
        );

        targetDrafts.forEach((t) => {
          connectionManager.putItem(draftStore, { ...t, order: t.order + 1 });
          t.order++;
        });
      } else if (oldIdx < newIdx) {
        const targetDrafts = this.drafts.filter(
          (t) => t.order <= newIdx && t.order > oldIdx && t.id !== draftId,
        );

        targetDrafts.forEach((t) => {
          connectionManager.putItem(draftStore, { ...t, order: t.order - 1 });
          t.order--;
        });
      }

      draft.order = newIdx;
      connectionManager.putItem(draftStore, { ...draft, order: newIdx });

      return draft;
    },
    async setProject(draftId: string | string[], projectId: string) {
      const connectionManager = await useIdbxConnectionManager();

      if (Array.isArray(draftId)) {
        this.drafts
          .filter((d) => draftId.includes(d.id))
          .forEach((d) => {
            d.projectId = projectId;
            connectionManager.putItem(draftStore, { ...d, projectId });
          });

        return;
      }
      const draft = this.getOne(draftId);
      if (!draft) return;

      draft.projectId = projectId;
      connectionManager.putItem(draftStore, { ...draft, projectId });
    },
  },
  getters: {
    getOne(state) {
      return (id: string): Draft | undefined => {
        return state.drafts.find((d) => d.id === id);
      };
    },
    getByProject(state) {
      return (projectId: string): Draft[] => {
        return state.drafts.filter((d) => d.projectId === projectId);
      };
    },
    sortedDrafts(state) {
      return state.drafts.sort((prev, next) => prev.order - next.order);
    },
    maxOrder(state): number {
      return state.drafts.length
        ? Math.max(...state.drafts.map((d) => d.order))
        : -1;
    },
  },
});
