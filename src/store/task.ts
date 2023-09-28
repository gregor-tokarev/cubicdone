import {defineStore} from "pinia";
import {useLocalStorage} from "@vueuse/core";
import {Task} from "../models/task.model.ts";
import {useDraftsStore} from "./drafts.ts";
import * as dayjs from "dayjs";
import {nanoid} from "nanoid";


export const useTaskStore = defineStore("task", {
    state: () => ({
        tasks: useLocalStorage<Task[]>("tasks", [])
    }),
    actions: {
        commitDraft(draftId: string, dateTodo: number): Task | undefined {
            console.log(dateTodo)
            const draftStore = useDraftsStore()

            const draft = draftStore.getOne(draftId)
            if (!draft) return

            const task: Task = {
                id: nanoid(3),
                title: draft.title,
                status: "todo",
                dateUpdated: draft.dateUpdated,
                dateCreated: draft.dateCreated,
                dateCommitted: Date.now(),
                dateCompleted: null,
                dateTodo: dayjs(dateTodo).valueOf()
            }

            this.tasks.push(task)
            draftStore.remove(draftId)
        },
        changeTodoDate(taskId: string, newDate: number): Task | undefined {
            const taskIdx = this.tasks.findIndex(t => t.id === taskId)
            this.tasks.splice(taskIdx, 1, {...this.tasks[taskIdx], dateTodo: newDate})

            return this.tasks[taskIdx]
        },
        update(taskId: string, newTask: Partial<Task>): Task | undefined {
            const taskIdx = this.tasks.findIndex(t => t.id === taskId)
            this.tasks.splice(taskIdx, 1, {...this.tasks[taskIdx], ...newTask})

            return this.tasks[taskIdx]
        }
    },
    getters: {
        getByDate(state) {
            return (date: string): Task[] => {
                const searchedDate = dayjs(date)

                return state.tasks.filter(t =>
                    dayjs(t.dateTodo).isSame(searchedDate, "day")
                ).sort((prev, next) => prev.dateCreated - next.dateCreated)
            }
        },
        getOne(state) {
            return (taskId: string): Task | undefined => {
                return state.tasks.find(t => t.id === taskId)
            }
        }
    }
})
