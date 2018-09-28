interface ITask {

    id: number
    text: string
    date: Date
    createdBy: string
    editedBy: string
    created: Date
    edited: Date

    toString(): string
    toJson(): Map<string>
}