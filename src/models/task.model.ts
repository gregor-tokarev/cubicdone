export interface Task {
    id: string
    title: string
    status: 'todo' | 'done'
    order: number;
    dateCreated: string
    dateUpdated: string
    dateCommitted: string
    dateCompleted: string | null
    dateTodo: string
}
