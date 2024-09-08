import type {t_Group, t_User} from "../generated/models"

export type CreateUser = {
  externalId: string | undefined
  email: string
  displayName: string
  disabled: boolean
}

export type CreateGroup = {
  externalId: string | undefined
  displayName: string
}

export interface IdpAdapter {
  listUsers(): Promise<t_User[]>
  getUser(id: string): Promise<t_User>
  createUser(user: CreateUser): Promise<t_User>
  createGroup(group: CreateGroup): Promise<t_Group>
}
