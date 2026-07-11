import Koa from "koa"
import {beforeAll, describe, expect, it} from "vitest"
import {startTestServer} from "../test-utils"
import {authenticationMiddleware} from "./authentication.middleware"

describe("authenticationMiddleware", () => {
  const secretKey = Buffer.from("super-secret", "utf-8")
  const middleware = authenticationMiddleware({secretKey})
  let baseUrl: string

  beforeAll(async () => {
    const app = new Koa()

    app.use(middleware)
    app.use((ctx) => {
      ctx.status = 200
      ctx.body = "ok"
    })

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should call next() if authorization header is valid", async () => {
    const response = await fetch(baseUrl, {
      headers: {authorization: "Bearer super-secret"},
    })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe("ok")
  })

  it("should return 401 if authorization header is missing", async () => {
    const response = await fetch(baseUrl)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({error: "unauthorized"})
  })

  it("should return 401 if bearer token is missing", async () => {
    const response = await fetch(baseUrl, {
      headers: {authorization: "Bearer "},
    })

    expect(response.status).toBe(401)
  })

  it("should return 401 if token length mismatch", async () => {
    const response = await fetch(baseUrl, {
      headers: {authorization: "Bearer short"},
    })

    expect(response.status).toBe(401)
  })

  it("should return 401 if token does not match", async () => {
    const response = await fetch(baseUrl, {
      headers: {authorization: "Bearer wrong-secret!"},
    })

    expect(response.status).toBe(401)
  })
})
