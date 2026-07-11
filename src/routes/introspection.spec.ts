import Koa from "koa"
import {beforeEach, describe, expect, it, vi} from "vitest"
import {
  t_ResourceType,
  t_ResourceTypes,
  t_Schema,
  t_Schemas,
  t_ServiceProviderConfig,
} from "../generated/models"
import {createIntrospectionRouter} from "../generated/routes/introspection"
import {
  IdpAdapter,
  ServiceProviderConfigCapabilities,
} from "../idp-adapters/types"
import {bodyMiddleware} from "../middleware/body.middleware"
import {errorMiddleware} from "../middleware/error.middleware"
import {startTestServer} from "../test-utils"
import {ReferenceFactory} from "../utils/reference-factory"
import {IntrospectionHandlers} from "./introspection"

describe("IntrospectionHandlers", () => {
  let handlers: IntrospectionHandlers
  let idpAdapter: IdpAdapter
  let referenceFactory: ReferenceFactory
  let baseUrl: string

  beforeEach(async () => {
    idpAdapter = {
      capabilities: vi.fn().mockResolvedValue({}),
      resourceTypes: vi.fn().mockResolvedValue([]),
      resourceSchemas: vi.fn().mockResolvedValue([]),
    } as unknown as IdpAdapter
    referenceFactory = {
      path: vi.fn().mockImplementation((p) => `http://localhost${p}`),
    } as unknown as ReferenceFactory
    handlers = new IntrospectionHandlers(idpAdapter, referenceFactory)

    const app = new Koa()

    app.use(errorMiddleware())
    app.use(bodyMiddleware())

    const router = createIntrospectionRouter(handlers)
    app.use(router.routes())
    app.use(router.allowedMethods())

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should get ServiceProviderConfig", async () => {
    vi.mocked(idpAdapter.capabilities).mockResolvedValue({
      patch: {supported: true},
      bulk: {supported: false},
    } as unknown as ServiceProviderConfigCapabilities)

    const response = await fetch(`${baseUrl}/scim/v2/ServiceProviderConfig`)
    expect(response.status).toBe(200)
    const body = (await response.json()) as t_ServiceProviderConfig
    expect(body.patch.supported).toBe(true)
    expect(body.bulk.supported).toBe(false)
    expect(body.schemas).toContain(
      "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig",
    )
  })

  it("should get ResourceTypes", async () => {
    const resourceTypes = [
      {
        id: "User",
        name: "User",
        description: "User Account",
        endpoint: "/Users",
        schema: "urn:ietf:params:scim:schemas:core:2.0:User",
        schemaExtensions: [],
      },
    ]
    vi.mocked(idpAdapter.resourceTypes).mockResolvedValue(
      resourceTypes as unknown as t_ResourceType[],
    )

    const response = await fetch(`${baseUrl}/scim/v2/ResourceTypes`)
    expect(response.status).toBe(200)
    const body = (await response.json()) as t_ResourceTypes
    expect(body.totalResults).toBe(1)
    expect(body.Resources).toMatchObject(resourceTypes)
  })

  it("should get Schemas", async () => {
    const schemas = [
      {
        id: "urn:ietf:params:scim:schemas:core:2.0:User",
        name: "User",
        description: "User Schema",
        attributes: [],
      },
    ]
    vi.mocked(idpAdapter.resourceSchemas).mockResolvedValue(
      schemas as unknown as t_Schema[],
    )

    const response = await fetch(`${baseUrl}/scim/v2/Schemas`)
    expect(response.status).toBe(200)
    const body = (await response.json()) as t_Schemas
    expect(body.totalResults).toBe(1)
    expect(body.Resources).toMatchObject(schemas)
  })
})
