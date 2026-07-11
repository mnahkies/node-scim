import {describe, expect, it} from "vitest"
import {ZodError, ZodIssue} from "zod"
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  InvalidSyntaxError,
  NotFoundError,
  PatchError,
  ValidationError,
} from "./errors"

describe("DomainErrors", () => {
  describe("NotFoundError", () => {
    it("should correctly serialize to JSON", () => {
      const error = new NotFoundError("user-123")
      expect(error.toJSON()).toMatchObject({
        status: 404,
        detail: 'Resource "user-123" not found',
        metadata: {id: "user-123"},
      })
    })
  })

  describe("ConflictError", () => {
    it("should correctly serialize to JSON", () => {
      const error = new ConflictError("existing-email@example.com")
      expect(error.toJSON()).toMatchObject({
        status: 409,
        scimType: "uniqueness",
        detail:
          "Conflicts with existing resource for unique field with value 'existing-email@example.com'",
        metadata: {value: "existing-email@example.com"},
      })
    })
  })

  describe("PatchError", () => {
    it("should correctly serialize to JSON", () => {
      const error = new PatchError("Invalid patch operation", "invalidFilter")
      expect(error.toJSON()).toMatchObject({
        status: 400,
        scimType: "invalidFilter",
        detail: "Invalid patch operation",
      })
    })
  })

  describe("InvalidSyntaxError", () => {
    it("should handle ZodError correctly", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["userName"],
          message: "Expected string, received number",
        } as unknown as ZodIssue,
      ])
      const error = new InvalidSyntaxError(zodError)
      const json = error.toJSON()
      expect(json.status).toBe(400)
      expect(json.scimType).toBe("invalidSyntax")
      expect(json.metadata).toEqual({issues: zodError.issues})
    })

    it("should handle generic Error correctly", () => {
      const genericError = new Error("Something went wrong")
      const error = new InvalidSyntaxError(genericError)
      const json = error.toJSON()
      expect(json.status).toBe(400)
      expect(json.scimType).toBe("invalidSyntax")
      expect(json.metadata).toMatchObject({
        message: "Something went wrong",
      })
    })
  })

  describe("ValidationError", () => {
    it("should correctly serialize to JSON", () => {
      const genericError = new Error("Validation failed")
      const error = new ValidationError(genericError)
      const json = error.toJSON()
      expect(json.status).toBe(400)
      expect(json.scimType).toBe("invalidValue")
    })
  })

  describe("ForbiddenError", () => {
    it("should correctly serialize to JSON", () => {
      const error = new ForbiddenError()
      expect(error.toJSON()).toMatchObject({
        status: 403,
        detail: "Forbidden",
      })
    })
  })

  describe("InternalServerError", () => {
    it("should correctly serialize to JSON", () => {
      const cause = new Error("Database down")
      const error = new InternalServerError(cause)
      const json = error.toJSON()
      expect(json.status).toBe(500)
      expect(json.detail).toBe("Internal server error")
      expect(json.metadata).toMatchObject({
        message: "Database down",
      })
    })
  })
})
