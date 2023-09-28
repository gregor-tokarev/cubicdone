export interface Task {
    id: string
    title: string
    status: 'todo' | 'done'
    dateUpdated: string
}
