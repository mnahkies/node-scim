/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {z} from "zod"

export const PermissiveBoolean = z.preprocess((value) => {
  if (typeof value === "string" && (value === "true" || value === "false")) {
    return value === "true"
  } else if (typeof value === "number" && (value === 1 || value === 0)) {
    return value === 1
  }
  return value
}, z.boolean())

export const s_GroupCollection = z.object({
  schemas: z.array(z.string()),
  totalResults: z.coerce.number(),
  startIndex: z.coerce.number(),
  itemsPerPage: z.coerce.number(),
  resources: z.array(z.any()),
})

export const s_GroupPatchOp = z.object({
  schemas: z.array(
    z.string().default("urn:ietf:params:scim:api:messages:2.0:PatchOp"),
  ),
  operations: z.array(
    z.object({
      op: z.string(),
      value: z.object({
        id: z.string().optional(),
        displayName: z.string().optional(),
      }),
    }),
  ),
})

export const s_GroupResourceMeta = z.object({
  resourceType: z.enum(["Group"]).optional(),
})

export const s_GroupResourceSchemas = z
  .array(z.enum(["urn:ietf:params:scim:schemas:core:2.0:Group"]))
  .default(["urn:ietf:params:scim:schemas:core:2.0:Group"])

export const s_UserEmail = z.object({
  primary: PermissiveBoolean.optional().default(false),
  type: z.string().optional(),
  value: z.string().email(),
  display: z.string().optional(),
})

export const s_UserFullName = z.object({
  formatted: z.string().optional(),
  familyName: z.string().optional(),
  givenName: z.string().optional(),
  middleName: z.string().optional(),
  honorificPrefix: z.string().optional(),
  honorificSuffix: z.string().optional(),
})

export const s_UserPatchOp = z.object({
  schemas: z
    .array(z.enum(["urn:ietf:params:scim:api:messages:2.0:PatchOp"]))
    .default(["urn:ietf:params:scim:api:messages:2.0:PatchOp"]),
  operations: z.array(
    z.object({
      op: z.string(),
      value: z.object({active: PermissiveBoolean}),
    }),
  ),
})

export const s_UserResourceMeta = z
  .object({resourceType: z.enum(["User"]).optional()})
  .default({resourceType: "User"})

export const s_UserResourceSchemas = z
  .array(z.enum(["urn:ietf:params:scim:schemas:core:2.0:User"]))
  .default(["urn:ietf:params:scim:schemas:core:2.0:User"])

export const s_CreateGroup = z.object({
  schemas: s_GroupResourceSchemas,
  externalId: z.string(),
  displayName: z.string(),
})

export const s_CreateUser = z.object({
  schemas: s_UserResourceSchemas,
  externalId: z.string().optional(),
  userName: z.string(),
  displayName: z.string().optional(),
  name: s_UserFullName.optional(),
  emails: z.array(s_UserEmail).default([]),
  active: PermissiveBoolean.default(true),
  groups: z.array(z.any()).default([]),
})

export const s_Group = s_CreateGroup.merge(
  z.object({
    id: z.string(),
    members: z.array(z.any()).optional().default([]),
    meta: s_GroupResourceMeta.optional(),
  }),
)

export const s_User = s_CreateUser.merge(
  z.object({id: z.string().optional(), meta: s_UserResourceMeta}),
)

export const s_UserCollection = z.object({
  schemas: s_UserResourceSchemas,
  totalResults: z.coerce.number(),
  startIndex: z.coerce.number(),
  itemsPerPage: z.coerce.number(),
  resources: z.array(s_User),
})

export const s_getScimV2ServiceProviderConfigJson200Response = z.object({})

export const s_getScimV2ResourceTypesJson200Response = z.object({})

export const s_getScimV2SchemasJson200Response = z.object({})
