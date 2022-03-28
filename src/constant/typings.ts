export interface IReport {
    id: number,
    title: string,
    finish?: string,
    unfinish?: string,
    thinking?: string,
    time: number,
    percent?: number,
    userId: number,
    createdAt: string,
    updatedAt: string
}

export interface IPlan {
    id: number,
    target: string,
    progress: number,
    totalTime: number,
    userId: number,
    deadline: string,
    createdAt: string,
    updatedAt: string,
    items: IItem[]
}

export interface IItem {
    id: number,
    text: string,
    isFinish: boolean,
    planId: number,
    createdAt: string,
    updatedAt: string
}

