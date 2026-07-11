import Koa from "koa"
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  vi,
} from "vitest"
import {startTestServer} from "../test-utils"
import {loggerMiddleware} from "./logger.middleware"

describe("loggerMiddleware", () => {
  const middleware = loggerMiddleware()
  let consoleInfoSpy: Mock<typeof console.info>
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

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleInfoSpy.mockRestore()
  })

  it("should log request and response", async () => {
    await fetch(baseUrl)

    expect(consoleInfoSpy).toHaveBeenCalledTimes(2)
    expect(consoleInfoSpy.mock.calls[0][0]).toContain("request started")
    expect(consoleInfoSpy.mock.calls[1][0]).toContain("request complete")
  })
})
