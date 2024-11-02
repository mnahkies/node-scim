import type {
  t_CreateGroup,
  t_Group,
  t_ResourceType,
  t_Schema,
  t_ServiceProviderConfig,
  t_User,
} from "../generated/models"

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

export type ServiceProviderConfigCapabilities = Partial<
  Omit<
    t_ServiceProviderConfig,
    "documentationUri" | "authenticationSchemes" | "meta" | "schemas"
  >
>

export abstract class IdpAdapter {
  abstract checkAuth(): Promise<void>

  abstract capabilities(): Promise<ServiceProviderConfigCapabilities>

  abstract resourceTypes(): Promise<t_ResourceType[]>

  abstract resourceSchemas(): Promise<t_Schema[]>

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
