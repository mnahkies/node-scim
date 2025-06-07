import {describe, expect, it} from "@jest/globals"
import {getType, parseFilter} from "./utils"

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
  describe("#parseFilter", () => {
    it("parses basic equality", () => {
      const ast = parseFilter('userName eq "bjensen"')
      expect(ast).toBeDefined()
      // expect(ast).toMatchObject(...) // add structure checks if needed
    })

    it("parses co substring match", () => {
      const ast = parseFilter('name.familyName co "O\'Malley"')
      expect(ast).toBeDefined()
    })

    it("parses sw (starts with)", () => {
      const ast = parseFilter('userName sw "J"')
      expect(ast).toBeDefined()
    })

    it("parses schema-qualified attrPath", () => {
      const ast = parseFilter(
        'urn:ietf:params:scim:schemas:core:2.0:User:userName sw "J"',
      )
      expect(ast).toBeDefined()
    })

    it("parses presence", () => {
      const ast = parseFilter("title pr")
      expect(ast).toBeDefined()
    })

    it("parses greater than date", () => {
      const ast = parseFilter('meta.lastModified gt "2011-05-13T04:42:34Z"')
      expect(ast).toBeDefined()
    })

    it("parses greater or equal", () => {
      const ast = parseFilter('meta.lastModified ge "2011-05-13T04:42:34Z"')
      expect(ast).toBeDefined()
    })

    it("parses less than", () => {
      const ast = parseFilter('meta.lastModified lt "2011-05-13T04:42:34Z"')
      expect(ast).toBeDefined()
    })

    it("parses less or equal", () => {
      const ast = parseFilter('meta.lastModified le "2011-05-13T04:42:34Z"')
      expect(ast).toBeDefined()
    })

    it("parses and expression", () => {
      const ast = parseFilter('title pr and userType eq "Employee"')
      expect(ast).toBeDefined()
    })

    it("parses or expression", () => {
      const ast = parseFilter('title pr or userType eq "Intern"')
      expect(ast).toBeDefined()
    })

    it("parses long schema filter", () => {
      const ast = parseFilter(
        'schemas eq "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"',
      )
      expect(ast).toBeDefined()
    })

    it("parses and with grouped or", () => {
      const ast = parseFilter(
        'userType eq "Employee" and (emails co "example.com" or emails.value co "example.org")',
      )
      expect(ast).toBeDefined()
    })

    it("parses and with not and grouped or", () => {
      const ast = parseFilter(
        'userType ne "Employee" and not (emails co "example.com" or emails.value co "example.org")',
      )
      expect(ast).toBeDefined()
    })

    it("parses and with grouped sub-attr", () => {
      const ast = parseFilter(
        'userType eq "Employee" and (emails.type eq "work")',
      )
      expect(ast).toBeDefined()
    })

    it("parses valuePath with and inside", () => {
      const ast = parseFilter(
        'userType eq "Employee" and emails[type eq "work" and value co "@example.com"]',
      )
      expect(ast).toBeDefined()
    })

    it("parses or between valuePaths", () => {
      const ast = parseFilter(
        'emails[type eq "work" and value co "@example.com"] or ims[type eq "xmpp" and value co "@foo.com"]',
      )
      expect(ast).toBeDefined()
    })
  })
})
