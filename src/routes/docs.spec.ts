import Koa from "koa"
import {beforeEach, describe, expect, it} from "vitest"
import {startTestServer} from "../test-utils"
import {createDocsRouter} from "./docs"

describe("DocsRouter", () => {
  let baseUrl: string

  beforeEach(async () => {
    const app = new Koa()

    const router = createDocsRouter()
    app.use(router.routes())
    app.use(router.allowedMethods())

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should serve openapi.yaml", async () => {
    const response = await fetch(`${baseUrl}/openapi.yaml`)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/yaml")
    const body = await response.text()
    expect(body).toContain("openapi: 3.1.0")
  })

  it("should serve docs html", async () => {
    const response = await fetch(`${baseUrl}/docs`)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("text/html")
    const body = await response.text()
    expect(body).toContain("<title>API Reference - node-scim</title>")
    expect(body).toContain("<redoc spec-url='/openapi.yaml'></redoc>")
  })

  it("should serve individual openapi files", async () => {
    const response = await fetch(`${baseUrl}/docs/openapi/common.yaml`)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/yaml")
    const body = await response.text()
    expect(body).toBeDefined()
  })

  it("should return 403 for files not in allow list", async () => {
    // Note: errorMiddleware is NOT used in this test setup to see the raw error or Koa's default handling
    // However, createDocsRouter uses StaticFileLoader which throws ForbiddenError.
    // Koa without error middleware will return 403 for ForbiddenError if it has a status property.
    const response = await fetch(`${baseUrl}/docs/openapi/nonexistent.yaml`)
    expect(response.status).toBe(403)
  })
})
