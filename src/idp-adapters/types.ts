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

export interface IdpAdapter {
  listUsers(pagination: PaginationParams): Promise<t_User[]>
  getUser(id: string): Promise<t_User>
  createUser(user: CreateUser): Promise<t_User>
  updateUser(id: string, user: CreateUser): Promise<t_User>
  createGroup(group: t_CreateGroup): Promise<t_Group>
  replaceGroup(id: string, group: t_Group): Promise<t_Group>
  listGroups(pagination: PaginationParams): Promise<t_Group[]>
}
