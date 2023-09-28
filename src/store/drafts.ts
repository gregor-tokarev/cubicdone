import {defineStore} from "pinia";
import {useLocalStorage} from "@vueuse/core";
import {Draft} from "../models/draft.model.ts";
import {nanoid} from "nanoid";

export const useDraftsStore = defineStore("drafts", {
    state: () => ({
        drafts: useLocalStorage<Draft[]>("drafts", []),
    }),
    actions: {
        create(title: string): Draft {
            console.log("some 1")
            const draft: Draft = {
                id: nanoid(3),
                dateCreated: Date.now(),
                dateUpdated: Date.now(),
                title
            }
            console.log("some 2")

            this.drafts.push(draft)
            console.log("some 3")

            return draft
        },
        edit(id: string, title: string): Draft | undefined {
            const draft = this.drafts.find(d => d.id === id)
            if (!draft) return

            draft.title = title
            draft.dateUpdated = Date.now()
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
            return state.drafts.sort((prev, next) => next.dateCreated - prev.dateCreated)
        }
    }
})
