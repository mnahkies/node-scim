/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

export type t_BaseMeta = {
  created?: string | undefined
  lastModified?: string | undefined
  location?: string | undefined
  version?: string | undefined
}

export type t_CreateGroup = {
  displayName: string
  externalId?: string | undefined
  schemas: t_GroupResourceSchemas
}

export type t_CreateUser = {
  active: boolean
  displayName?: string | undefined
  emails: t_UserEmail[]
  externalId?: string | undefined
  groups: t_UserGroup[]
  name?: t_UserFullName | undefined
  schemas: t_UserResourceSchemas
  userName: string
}

export type t_Group = t_CreateGroup & {
  id: string
  members?: t_GroupMember[] | undefined
  meta?:
    | (t_BaseMeta & {
        resourceType?: "ServiceProviderConfig" | undefined
      })
    | undefined
}

export type t_GroupMember = {
  $ref?: string | undefined
  type?: ("User" | "Group") | undefined
  value: string
}

export type t_GroupResourceSchemas =
  "urn:ietf:params:scim:schemas:core:2.0:Group"[]

export type t_GroupsListing = t_ListResponse & {
  Resources: t_Group[]
}

export type t_ListResponse = {
  itemsPerPage?: number | undefined
  schemas?: "urn:ietf:params:scim:api:messages:2.0:ListResponse"[] | undefined
  startIndex?: number | undefined
  totalResults: number
}

export type t_PatchOperation = {
  op: "add" | "remove" | "replace"
  path?: string | undefined
  value?: any | undefined
}

export type t_ResourceType = {
  description: string
  endpoint?: string | undefined
  id?: string | undefined
  name: string
  schema: string
  schemaExtensions: {
    required?: boolean | undefined
    schema?: string | undefined
  }[]
}

export type t_ResourceTypes = t_ListResponse & {
  Resources: t_ResourceType[]
}

export type t_Schema = {
  attributes?: t_ScimAttribute[] | undefined
  description?: string | undefined
  id?: string | undefined
  meta?:
    | {
        location?: string | undefined
        resourceType?: string | undefined
      }
    | undefined
  name?: string | undefined
  schemas?: "urn:ietf:params:scim:schemas:core:2.0:Schema"[] | undefined
}

export type t_Schemas = t_ListResponse & {
  Resources: t_Schema[]
}

export type t_ScimAttribute = {
  caseExact?: boolean | undefined
  description: string
  multiValued: boolean
  mutability: string
  name: string
  required: boolean
  returned: string
  type: string
  uniqueness?: ("none" | "server" | "global") | undefined
}

export type t_ScimException = {
  detail: string
  metadata?:
    | {
        [key: string]: any | undefined
      }
    | undefined
  schemas: "urn:ietf:params:scim:api:messages:2.0:Error"[]
  scimType?: t_ScimExceptionType | undefined
  status: number
}

export type t_ScimExceptionType =
  | "invalidFilter"
  | "tooMany"
  | "uniqueness"
  | "mutability"
  | "invalidSyntax"
  | "invalidPath"
  | "noTarget"
  | "invalidValue"
  | "invalidVers"
  | "sensitive"

export type t_ServiceProviderConfig = {
  authenticationSchemes: t_ServiceProviderConfigAuthenticationScheme[]
  bulk: {
    maxOperations?: number | undefined
    maxPayloadSize?: number | undefined
    supported?: boolean | undefined
  }
  changePassword: {
    supported?: boolean | undefined
  }
  documentationUri?: string | undefined
  etag: {
    supported?: boolean | undefined
  }
  filter: {
    maxResults?: number | undefined
    supported?: boolean | undefined
  }
  meta?:
    | (t_BaseMeta & {
        resourceType?: "ServiceProviderConfig" | undefined
      })
    | undefined
  pagination?:
    | {
        cursor?: boolean | undefined
        cursorTimeout?: number | undefined
        defaultPageSize?: number | undefined
        defaultPaginationMethod?: ("index" | "cursor") | undefined
        index?: boolean | undefined
        maxPageSize?: number | undefined
      }
    | undefined
  patch: {
    supported?: boolean | undefined
  }
  schemas?:
    | "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"[]
    | undefined
  sort: {
    supported?: boolean | undefined
  }
}

export type t_ServiceProviderConfigAuthenticationScheme = {
  description: string
  documentationUri?: string | undefined
  name: string
  primary?: boolean | undefined
  specUri?: string | undefined
  type: "oauth" | "oauth2" | "oauthbearertoken" | "httpbasic" | "httpdigest"
}

export type t_User = t_CreateUser & {
  id: string
  meta: t_UserResourceMeta
}

export type t_UserEmail = {
  display?: string | undefined
  primary?: boolean | undefined
  type?: string | undefined
  value: string
}

export type t_UserFullName = {
  familyName?: string | undefined
  formatted?: string | undefined
  givenName?: string | undefined
  honorificPrefix?: string | undefined
  honorificSuffix?: string | undefined
  middleName?: string | undefined
}

export type t_UserGroup = {
  $ref?: string | undefined
  display?: string | undefined
  type?: ("direct" | "indirect") | undefined
  value?: string | undefined
}

export type t_UserResourceMeta = {
  resourceType?: "User" | undefined
}

export type t_UserResourceSchemas =
  "urn:ietf:params:scim:schemas:core:2.0:User"[]

export type t_UsersListing = t_ListResponse & {
  Resources: t_User[]
}

export type t_DeleteScimV2GroupsIdParamSchema = {
  id: string
}

export type t_DeleteScimV2GroupsIdQuerySchema = {
  excludedAttributes?: string | undefined
}

export type t_DeleteScimV2UsersIdParamSchema = {
  id: string
}

export type t_GetScimV2GroupsQuerySchema = {
  count?: number | undefined
  excludedAttributes?: string | undefined
  filter?: string | undefined
  startIndex?: number | undefined
}

export type t_GetScimV2GroupsIdParamSchema = {
  id: string
}

export type t_GetScimV2GroupsIdQuerySchema = {
  excludedAttributes?: string | undefined
}

export type t_GetScimV2UsersQuerySchema = {
  count?: number | undefined
  filter?: string | undefined
  startIndex?: number | undefined
}

export type t_GetScimV2UsersIdParamSchema = {
  id: string
}

export type t_PatchScimV2GroupsIdBodySchema = {
  Operations?: t_PatchOperation[] | undefined
  schemas: "urn:ietf:params:scim:api:messages:2.0:PatchOp"[]
}

export type t_PatchScimV2GroupsIdParamSchema = {
  id: string
}

export type t_PatchScimV2GroupsIdQuerySchema = {
  excludedAttributes?: string | undefined
}

export type t_PatchScimV2UsersIdBodySchema = {
  Operations?: t_PatchOperation[] | undefined
  schemas: "urn:ietf:params:scim:api:messages:2.0:PatchOp"[]
}

export type t_PatchScimV2UsersIdParamSchema = {
  id: string
}

export type t_PostScimV2GroupsBodySchema = {
  displayName: string
  externalId?: string | undefined
  schemas: t_GroupResourceSchemas
}

export type t_PostScimV2UsersBodySchema = {
  active: boolean
  displayName?: string | undefined
  emails: t_UserEmail[]
  externalId?: string | undefined
  groups: t_UserGroup[]
  name?: t_UserFullName | undefined
  schemas: t_UserResourceSchemas
  userName: string
}

export type t_PutScimV2GroupsIdBodySchema = {
  displayName: string
  externalId?: string | undefined
  schemas: t_GroupResourceSchemas
}

export type t_PutScimV2GroupsIdParamSchema = {
  id: string
}

export type t_PutScimV2GroupsIdQuerySchema = {
  excludedAttributes?: string | undefined
}

export type t_PutScimV2UsersIdBodySchema = {
  active: boolean
  displayName?: string | undefined
  emails: t_UserEmail[]
  externalId?: string | undefined
  groups: t_UserGroup[]
  name?: t_UserFullName | undefined
  schemas: t_UserResourceSchemas
  userName: string
}

export type t_PutScimV2UsersIdParamSchema = {
  id: string
}
