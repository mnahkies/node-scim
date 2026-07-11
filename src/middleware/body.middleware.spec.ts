import Koa from "koa"
import {beforeAll, describe, expect, it} from "vitest"
import {startTestServer} from "../test-utils"
import {bodyMiddleware} from "./body.middleware"

describe("bodyMiddleware", () => {
  const middleware = bodyMiddleware()
  let baseUrl: string

  beforeAll(async () => {
    const app = new Koa()

    app.use(middleware)
    app.use((ctx) => {
      if (ctx.path === "/echo") {
        ctx.body = ctx.request.body
      } else {
        ctx.body = {ok: true}
      }
    })

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should parse body if Content-Type is SCIM", async () => {
    const body = {userName: "test"}
    const response = await fetch(`${baseUrl}/echo`, {
      method: "POST",
      headers: {"Content-Type": "application/scim+json"},
      body: JSON.stringify(body),
    })

    expect(await response.json()).toEqual(body)
  })

  it("should override Content-Type and stringify body if Accept is SCIM", async () => {
    const response = await fetch(baseUrl, {
      headers: {Accept: "application/scim+json"},
    })

    expect(response.headers.get("Content-Type")).toBe("application/scim+json")
    const text = await response.text()
    expect(typeof text).toBe("string")
    expect(JSON.parse(text)).toEqual({ok: true})
  })

  it("should not parse body if Content-Type is missing", async () => {
    const response = await fetch(`${baseUrl}/echo`, {
      method: "POST",
      body: JSON.stringify({userName: "test"}),
    })

    const responseBody = await response.text()
    expect(responseBody).toBe("")
  })
})
