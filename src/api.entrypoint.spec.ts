import {beforeEach, describe, expect, it, vi} from "vitest"
import {main} from "./api.entrypoint"

vi.mock("./idp-adapters/firebase", () => {
  return {
    FirebaseAuthIdpAdapter: class {
      checkAuth = vi.fn().mockResolvedValue(undefined)
      capabilities = vi.fn().mockResolvedValue({})
      resourceTypes = vi.fn().mockResolvedValue([])
      resourceSchemas = vi.fn().mockResolvedValue([])
    },
  }
})

describe("api.entrypoint", () => {
  beforeEach(() => {
    vi.stubEnv("PORT", "0")
    vi.stubEnv("HOSTNAME", "localhost")
    vi.stubEnv("SECRET_KEY", "test-secret-key")
    vi.stubEnv("PROJECT_ID", "test-project")
    vi.stubEnv("PROVIDER_ID", "test-provider")
    vi.stubEnv("USERNAME_EMAIL_DOMAIN", "example.com")
  })

  it("should start application", async () => {
    const {server, address} = await main()

    expect(address.port).toBeGreaterThan(0)
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })
})
