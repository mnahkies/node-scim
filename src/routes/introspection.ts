import {Service} from "diod"
import type {
  GetScimV2ResourceTypes,
  GetScimV2Schemas,
  GetScimV2ServiceProviderConfig,
  Implementation,
} from "../generated/routes/introspection"
import {IdpAdapter} from "../idp-adapters/types"
import {ReferenceFactory} from "../utils/reference-factory"

@Service()
export class IntrospectionHandlers implements Implementation {
  constructor(
    private readonly idpAdaptor: IdpAdapter,
    private readonly referenceManager: ReferenceFactory,
  ) {}

  getScimV2ServiceProviderConfig: GetScimV2ServiceProviderConfig = async (
    _,
    respond,
  ) => {
    const now = new Date().toISOString()

    const capabilities = await this.idpAdaptor.capabilities()

    return respond.with200().body({
      documentationUri: "https://example.com/docs",
      patch: {
        supported: false,
        ...capabilities.patch,
      },
      bulk: {
        supported: false,
        ...capabilities.bulk,
      },
      filter: {
        supported: false,
        ...capabilities.filter,
      },
      changePassword: {
        supported: false,
        ...capabilities.changePassword,
      },
      sort: {
        supported: false,
        ...capabilities.sort,
      },
      etag: {
        supported: false,
        ...capabilities.etag,
      },
      pagination: {
        cursor: false,
        index: false,
        ...capabilities.pagination,
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
      meta: {
        location: this.referenceManager.path("/scim/v2/ServiceProviderConfig"),
        resourceType: "ServiceProviderConfig",
        created: now,
        lastModified: now,
      },
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
    })
  }

  getScimV2ResourceTypes: GetScimV2ResourceTypes = async (_, respond) => {
    const Resources = await this.idpAdaptor.resourceTypes()

    return respond.with200().body({
      totalResults: Resources.length,
      Resources,
    })
  }

  getScimV2Schemas: GetScimV2Schemas = async (_, respond) => {
    const Resources = await this.idpAdaptor.resourceSchemas()

    return respond.with200().body({
      totalResults: Resources.length,
      Resources,
    })
  }
}
