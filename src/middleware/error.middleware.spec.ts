import {
  KoaRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-koa-runtime/errors"
import Koa from "koa"
import {beforeAll, describe, expect, it} from "vitest"
import {NotFoundError} from "../errors"
import {startTestServer} from "../test-utils"
import {errorMiddleware} from "./error.middleware"

describe("errorMiddleware", () => {
  const middleware = errorMiddleware()
  let baseUrl: string

  beforeAll(async () => {
    const app = new Koa()

    app.use(middleware)
    app.use((ctx) => {
      if (ctx.path === "/error/not-found") {
        throw new NotFoundError("some-id")
      }
      if (ctx.path === "/error/generic") {
        throw new Error("unexpected")
      }
      if (ctx.path === "/error/koa-runtime") {
        throw KoaRuntimeError.RequestError(
          new Error("invalid json"),
          RequestInputType.RequestBody,
        )
      }
      if (ctx.path === "/status/404") {
        ctx.status = 404
        return
      }
      ctx.status = 200
      ctx.body = "ok"
    })

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should do nothing if next() succeeds and status is not 404", async () => {
    const response = await fetch(baseUrl)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("ok")
  })

  it("should throw NotFoundError if status is 404 after next()", async () => {
    const response = await fetch(`${baseUrl}/status/404`)
    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({
      detail: 'Resource "/status/404" not found',
    })
  })

  it("should handle DomainError thrown by next()", async () => {
    const response = await fetch(`${baseUrl}/error/not-found`)
    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({
      detail: 'Resource "some-id" not found',
    })
  })

  it("should handle generic Error thrown by next()", async () => {
    const response = await fetch(`${baseUrl}/error/generic`)
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({
      detail: "Internal server error",
    })
  })

  it("should handle KoaRuntimeError with request_validation phase", async () => {
    const response = await fetch(`${baseUrl}/error/koa-runtime`)
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      scimType: "invalidSyntax",
    })
  })

  it("should set correct Content-Type if Accept header is SCIM", async () => {
    const response = await fetch(`${baseUrl}/error/generic`, {
      headers: {Accept: "application/scim+json"},
    })
    expect(response.headers.get("Content-Type")).toContain(
      "application/scim+json",
    )
  })
})
