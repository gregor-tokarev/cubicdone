export interface Task {
    id: string
    title: string
    status: 'todo' | 'done'
    dateCreated: number
    dateUpdated: number
    dateCommitted: number
    dateCompleted: number | null
    dateTodo: number
}
