import { defineStore } from "pinia";
import { Draft, draftTable } from "@models/draft.model.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { idbContextManager } from "../main.ts";

export const useDraftsStore = defineStore("drafts", {
  state: () => ({
    drafts: [] as Draft[],
  }),
  actions: {
    // revertFromTask(taskId: string) {
    //     const taskStore = useTaskStore()
    //
    //     const task = taskStore.getOne(taskId)
    //     if (!task) return
    //
    //     const draft: Draft = {
    //         id: nanoid(3),
    //         dateCreated: task.dateCreated,
    //         dateUpdated: task.dateUpdated,
    //         title: task.title
    //     }
    //
    //     this.drafts.push(draft)
    //
    //     taskStore.remove(taskId)
    // },
    async loadDrafts() {
      this.drafts = await idbContextManager.getItems(draftTable);
    },
    create(title: string, projectId: string | null): Draft {
      const draft: Draft = {
        id: nanoid(3),
        dateCreated: dayjs().toISOString(),
        dateUpdated: dayjs().toISOString(),
        order: this.maxOrder + 1,
        projectId,
        title,
      };

      idbContextManager.putItem(draftTable, draft);
      this.drafts.push(draft);

      return draft;
    },
    edit(id: string, title: string): Draft | undefined {
      const draft = this.drafts.find((d) => d.id === id);
      if (!draft) return;

      draft.title = title;
      draft.dateUpdated = dayjs().toISOString();

      idbContextManager.putItem(draftTable, draft);
    },
    remove(id: string | string[]): void {
      idbContextManager.deleteItem(draftTable, id);

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
    descOrders(draftId: string) {
      const draft = this.getOne(draftId);
      if (!draft) return;

      this.drafts
        .filter((d) => d.order >= draft.order && d.id !== draftId)
        .forEach((d) => {
          idbContextManager.putItem(draftTable, { ...d, order: d.order - 1 });
          d.order--;
        });
    },
    changeOrder(
      draftId: string,
      oldIdx: number,
      newIdx: number,
    ): Draft | undefined {
      const draft = this.getOne(draftId);
      if (!draft) return;

      if (oldIdx > newIdx) {
        const targetDrafts = this.drafts.filter(
          (t) => t.order >= newIdx && t.order < oldIdx && t.id !== draftId,
        );

        targetDrafts.forEach((t) => {
          idbContextManager.putItem(draftTable, { ...t, order: t.order + 1 });
          t.order++;
        });
      } else if (oldIdx < newIdx) {
        const targetDrafts = this.drafts.filter(
          (t) => t.order <= newIdx && t.order > oldIdx && t.id !== draftId,
        );

        targetDrafts.forEach((t) => {
          idbContextManager.putItem(draftTable, { ...t, order: t.order - 1 });
          t.order--;
        });
      }

      draft.order = newIdx;
      idbContextManager.putItem(draftTable, { ...draft, order: newIdx });

      return draft;
    },
    setProject(draftId: string | string[], projectId: string) {
      if (Array.isArray(draftId)) {
        this.drafts
          .filter((d) => draftId.includes(d.id))
          .forEach((d) => {
            d.projectId = projectId;
            idbContextManager.putItem(draftTable, { ...d, projectId });
          });

        return;
      }
      const draft = this.getOne(draftId);
      if (!draft) return;

      draft.projectId = projectId;
      idbContextManager.putItem(draftTable, { ...draft, projectId });
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
