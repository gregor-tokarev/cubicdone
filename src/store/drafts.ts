import {defineStore} from "pinia";
import {useLocalStorage} from "@vueuse/core";
import {Draft} from "../models/draft.model.ts";
import {nanoid} from "nanoid";
import {useTaskStore} from "./task.ts";
import dayjs from "dayjs";

export const useDraftsStore = defineStore("drafts", {
    state: () => ({
        drafts: useLocalStorage<Draft[]>("drafts", []),
    }),
    actions: {
        revertFromTask(taskId: string) {
            const taskStore = useTaskStore()

            const task = taskStore.getOne(taskId)
            if (!task) return

            const draft: Draft = {
                id: nanoid(3),
                dateCreated: task.dateCreated,
                dateUpdated: task.dateUpdated,
                title: task.title
            }

            this.drafts.push(draft)

            taskStore.remove(taskId)
        },
        create(title: string): Draft {
            const draft: Draft = {
                id: nanoid(3),
                dateCreated: dayjs().toISOString(),
                dateUpdated: dayjs().toISOString(),
                title
            }

            this.drafts.push(draft)

            return draft
        },
        edit(id: string, title: string): Draft | undefined {
            const draft = this.drafts.find(d => d.id === id)
            if (!draft) return

            draft.title = title
            draft.dateUpdated = dayjs().toISOString()
        },
        remove(id: string): void {
            const draftIdx = this.drafts.findIndex(d => d.id === id)
            this.drafts.splice(draftIdx, 1)
        }
    },

    getters: {
        getOne(state) {
            return (id: string): Draft | undefined => {
                return state.drafts.find(d => d.id === id)
            }
        },
        sortedDrafts(state) {
            return state.drafts
        }
    }
})
