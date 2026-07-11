import {describe, expect, it} from "vitest"
import {Config} from "../config"
import {ReferenceFactory} from "./reference-factory"

describe("ReferenceFactory", () => {
  const config = {
    hostname: "localhost",
    port: 8080,
  } as Config

  const factory = new ReferenceFactory(config)

  it("should create a path correctly", () => {
    expect(factory.path("/foo")).toBe("https://localhost:8080/foo")
  })

  it("should create a User $ref correctly", () => {
    expect(factory.create$Ref("user-123", "User")).toBe(
      "https://localhost:8080/scim/v2/Users/user-123",
    )
  })

  it("should create a Group $ref correctly", () => {
    expect(factory.create$Ref("group-456", "Group")).toBe(
      "https://localhost:8080/scim/v2/Groups/group-456",
    )
  })
})
