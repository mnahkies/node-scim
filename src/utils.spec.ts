import {describe, expect, it} from "@jest/globals"
import {getType} from "./utils"

describe("utils", () => {
  describe("#getType", () => {
    it("returns 'multi-value' when both inputs are arrays", () => {
      expect(getType([1, 2], ["a", "b"])).toBe("multi-value")
    })

    it("returns 'complex' when both inputs are plain objects", () => {
      expect(getType({a: 1}, {b: 2})).toBe("complex")
    })

    it("returns 'single-value' when obj is primitive and value is primitive", () => {
      expect(getType("abc", 123)).toBe("single-value")
    })
  })
})
