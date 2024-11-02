import {Service} from "diod"
import type {t_ResourceType} from "../generated/models"
import type {
  GetScimV2ResourceTypes,
  GetScimV2Schemas,
  GetScimV2ServiceProviderConfig,
  Implementation,
} from "../generated/routes/introspection"
import {ScimSchemaCoreGroup, ScimSchemaCoreUser} from "../scim-schemas"
import {ReferenceFactory} from "../utils/reference-factory"

@Service()
export class IntrospectionHandlers implements Implementation {
  constructor(private readonly referenceManager: ReferenceFactory) {}

  getScimV2ServiceProviderConfig: GetScimV2ServiceProviderConfig = async (
    _,
    respond,
  ) => {
    const now = new Date().toISOString()

    return respond.with200().body({
      documentationUri: "https://example.com/docs",
      patch: {
        supported: true,
      },
      bulk: {
        supported: false,
        maxPayloadSize: 1048576,
        maxOperations: 10,
      },
      filter: {
        supported: true,
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
          specUri: "https://www.rfc-editor.org/info/rfc6750",
          documentationUri: "https://example.com/help/oauth.html",
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
        location: this.referenceManager.path("/scim/v2/ServiceProviderConfig"),
        resourceType: "ServiceProviderConfig",
        created: now,
        lastModified: now,
      },
    })
  }

  getScimV2ResourceTypes: GetScimV2ResourceTypes = async (_, respond) => {
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

  getScimV2Schemas: GetScimV2Schemas = async (_, respond) => {
    const Resources = [ScimSchemaCoreUser, ScimSchemaCoreGroup]

    return respond.with200().body({
      totalResults: Resources.length,
      Resources,
    })
  }
}
