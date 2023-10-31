import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { Draft } from "@models/draft.model.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { IntegrationTask } from "@models/integration.model.ts";
import { useTaskStore } from "@store/task.ts";

export const useDraftsStore = defineStore("drafts", {
  state: () => ({
    drafts: useLocalStorage<Draft[]>("drafts", []),
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
    create(title: string, projectId: string | null): Draft {
      const draft: Draft = {
        id: nanoid(3),
        dateCreated: dayjs().toISOString(),
        dateUpdated: dayjs().toISOString(),
        order: this.maxOrder + 1,
        projectId,
        title,
      };

      this.drafts.push(draft);

      return draft;
    },
    commitFromIntegration(tasks: IntegrationTask[]): Draft[] {
      const drafts = tasks.map((it, idx) => ({
        id: it.id,
        title: it.title,
        projectId: null,
        dateCreated: it.createdAt,
        dateUpdated: it.updatedAt,
        order: this.maxOrder + 1 + idx,
        external: {
          integrationName: it.integrationName,
          projectTitle: it.projectTitle,
          projectId: it.projectId,
          iconURL: it.iconURL,
          link: it.link,
        },
      })) satisfies Draft[];

      const oldIds = this.drafts.map((d) => d.id);
      const taskStore = useTaskStore();
      const taskIds = taskStore.tasks.map((t) => t.draftId);

      const draftsToCommit = drafts.filter(
        (d) => oldIds.indexOf(d.id) === -1 && taskIds.indexOf(d.id) === -1,
      );

      this.drafts = [...this.drafts, ...draftsToCommit];

      return draftsToCommit;
    },
    edit(id: string, title: string): Draft | undefined {
      const draft = this.drafts.find((d) => d.id === id);
      if (!draft) return;

      draft.title = title;
      draft.dateUpdated = dayjs().toISOString();
    },
    remove(id: string): void {
      const draftIdx = this.drafts.findIndex((d) => d.id === id);
      this.drafts.splice(draftIdx, 1);
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

        targetDrafts.forEach((t) => t.order++);
      } else if (oldIdx < newIdx) {
        const targetDrafts = this.drafts.filter(
          (t) => t.order <= newIdx && t.order > oldIdx && t.id !== draftId,
        );

        targetDrafts.forEach((t) => t.order--);
      }

      draft.order = newIdx;

      return draft;
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
