import {config} from "../config"
import type {t_ResourceType} from "../generated/models"
import {
  type GetScimV2ResourceTypes,
  type GetScimV2Schemas,
  type GetScimV2ServiceProviderConfig,
  createRouter,
} from "../generated/routes/introspection"
import {ScimSchemaCoreGroup, ScimSchemaCoreUser} from "../scim-schemas"

const getScimV2ServiceProviderConfig: GetScimV2ServiceProviderConfig = async (
  _,
  respond,
) => {
  const now = new Date().toISOString()

  return respond.with200().body({
    patch: {
      supported: false,
    },
    bulk: {
      supported: false,
      maxPayloadSize: 1048576,
      maxOperations: 10,
    },
    filter: {
      supported: false,
      maxResults: 100,
    },
    changePassword: {
      supported: false,
    },
    sort: {
      supported: false,
    },
    etag: {
      supported: false,
    },
    authenticationSchemes: [
      {
        name: "OAuth Bearer Token",
        description:
          "Authentication scheme using the OAuth Bearer Token Standard",
        specUri: "http://www.rfc-editor.org/info/rfc6750",
        documentationUri: "http://example.com/help/oauth.html",
        type: "oauthbearertoken",
        primary: true,
      },
    ],
    pagination: {
      cursor: false,
      index: true,
      defaultPaginationMethod: "index",
      defaultPageSize: 10,
      maxPageSize: 100,
      cursorTimeout: 3600,
    },
    meta: {
      location: `http://${config.hostname}:${config.port}/scim/v2/ServiceProviderConfig`,
      resourceType: "ServiceProviderConfig",
      created: now,
      lastModified: now,
    },
  })
}

const getScimV2ResourceTypes: GetScimV2ResourceTypes = async (_, respond) => {
  const Resources = [
    {
      id: "User",
      name: "Users",
      description: "User Account",
      schema: "urn:ietf:params:scim:schemas:core:2.0:User",
      schemaExtensions: [
        // "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
      ],
    },
    {
      id: "Group",
      name: "Groups",
      description: "Group",
      schema: "urn:ietf:params:scim:schemas:core:2.0:Group",
      schemaExtensions: [],
    },
  ] satisfies t_ResourceType[]

  return respond.with200().body({
    totalResults: Resources.length,
    Resources,
  })
}

const getScimV2Schemas: GetScimV2Schemas = async (_, respond) => {
  const Resources = [ScimSchemaCoreUser, ScimSchemaCoreGroup]

  return respond.with200().body({
    totalResults: Resources.length,
    Resources,
  })
}

export function createIntrospectionRouter() {
  return createRouter({
    getScimV2ServiceProviderConfig,
    getScimV2ResourceTypes,
    getScimV2Schemas,
  })
}
