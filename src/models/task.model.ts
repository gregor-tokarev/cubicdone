export interface Task {
    id: string
    title: string
    status: 'todo' | 'done'
    dateCreated: string
    dateUpdated: string
    dateCommitted: string
    dateCompleted: string | null
    dateTodo: string
}
