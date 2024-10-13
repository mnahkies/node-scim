import type {t_CreateGroup, t_Group, t_User} from "../generated/models"

export type CreateUser = {
  externalId: string | undefined
  email: string
  displayName: string
  disabled: boolean
}

export type PaginationParams = {
  take: number | undefined
  skip: number | undefined
}

export abstract class IdpAdapter {
  abstract checkAuth(): Promise<void>
  abstract listUsers(pagination: PaginationParams): Promise<t_User[]>
  abstract getUser(id: string): Promise<t_User>
  abstract createUser(user: CreateUser): Promise<t_User>
  abstract deleteUser(id: string): Promise<void>
  abstract updateUser(id: string, user: CreateUser): Promise<t_User>
  abstract createGroup(group: t_CreateGroup): Promise<t_Group>
  abstract replaceGroup(id: string, group: t_Group): Promise<t_Group>
  abstract deleteGroup(id: string): Promise<void>
  abstract getGroup(id: string): Promise<t_Group>
  abstract listGroups(pagination: PaginationParams): Promise<t_Group[]>
}
