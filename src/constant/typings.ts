export interface IUser {
    id: number,
    token: string,
    isadmin: boolean,
    teamId: number,
    username: string
}

export interface IReport {
    id: number,
    title: string,
    finish: string,
    unfinish?: string,
    thinking?: string,
    time: number,
    createdBy: number,
    taskId: number,
    createdAt: string,
    updatedAt: string
}

export interface ITask {
    id: number,
    target: string,
    executedBy: number,
    createdBy: number,
    startAt: string,
    deadline: string,
    createdAt: string,
    updatedAt: string,
    isFinish: boolean,
    items: IItem[],
    reports: IReport[]
}

export interface IItem {
    id: number,
    text: string,
    isFinish: boolean,
    taskId: number,
    createdAt: string,
    updatedAt: string
}

interface ITeamMember extends IUser {
    reports: IReport[]
}

export interface ITeam {
    id: number,
    name: string,
    createdBy: number,
    createdAt: string,
    updatedAt: string,
    teamManager: IUser,
    teamMembers: ITeamMember[]
}

export interface IApplication {
    id: number,
    appliedBy: number,
    checkedBy: number,
    createdAt: string,
    updatedAt: string,
    team: ITeam,
    appliedUser: IUser,
    checkedUser: IUser
}