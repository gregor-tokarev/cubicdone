import {defineStore} from "pinia";
import {useLocalStorage} from "@vueuse/core";
import {Draft} from "../models/draft.model.ts";
import {nanoid} from "nanoid";
import * as dayjs from "dayjs";

export const useDraftsStore = defineStore("drafts", {
    state: () => ({
        drafts: useLocalStorage<Draft[]>("drafts", []),
    }),
    actions: {
        create(title: string): Draft {
            const draft: Draft = {
                id: nanoid(3),
                dateCreated: dayjs().format(),
                dateUpdated: dayjs().format(),
                title
            }

            this.drafts.push(draft)

            return draft
        },
        edit(id: string, title: string): Draft | undefined {
            const draft = this.drafts.find(d => d.id === id)
            if (!draft) return

            draft.title = title
            draft.dateUpdated = dayjs().format()
        }
    },

    getters: {
        getOne(state) {
            return (id: string) => {
                return state.drafts.find(d => d.id === id)
            }
        },
        sortedDrafts(state) {
            return state.drafts.sort((prev, next) => dayjs(prev.dateCreated).unix() - dayjs(next.dateCreated).unix())
        }
    }
})
