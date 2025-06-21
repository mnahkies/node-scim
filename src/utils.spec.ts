import {describe, expect, it} from "@jest/globals"
import {ScimSchemaCoreUser} from "./scim-schemas"
import {evaluateFilter, getType, parseFilter} from "./utils"

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
      expect(ast).toStrictEqual({
        attribute: {
          path: "userName",
          type: "attrPath",
        },
        operator: "eq",
        type: "comparison",
        value: "bjensen",
      })
    })

    it("parses co substring match", () => {
      const ast = parseFilter('name.familyName co "O\'Malley"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "name.familyName",
          type: "attrPath",
        },
        operator: "co",
        type: "comparison",
        value: "O'Malley",
      })
    })

    it("parses sw (starts with)", () => {
      const ast = parseFilter('userName sw "J"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "userName",
          type: "attrPath",
        },
        operator: "sw",
        type: "comparison",
        value: "J",
      })
    })

    it("parses schema-qualified attrPath", () => {
      const ast = parseFilter(
        'urn:ietf:params:scim:schemas:core:2.0:User:userName sw "J"',
      )
      expect(ast).toStrictEqual({
        attribute: {
          path: "urn:ietf:params:scim:schemas:core:2.0:User:userName",
          type: "attrPath",
        },
        operator: "sw",
        type: "comparison",
        value: "J",
      })
    })

    it("parses presence", () => {
      const ast = parseFilter("title pr")
      expect(ast).toStrictEqual({
        attribute: {
          path: "title",
          type: "attrPath",
        },
        type: "present",
      })
    })

    it("parses greater than date", () => {
      const ast = parseFilter('meta.lastModified gt "2011-05-13T04:42:34Z"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "meta.lastModified",
          type: "attrPath",
        },
        operator: "gt",
        type: "comparison",
        value: "2011-05-13T04:42:34Z",
      })
    })

    it("parses greater or equal", () => {
      const ast = parseFilter('meta.lastModified ge "2011-05-13T04:42:34Z"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "meta.lastModified",
          type: "attrPath",
        },
        operator: "ge",
        type: "comparison",
        value: "2011-05-13T04:42:34Z",
      })
    })

    it("parses less than", () => {
      const ast = parseFilter('meta.lastModified lt "2011-05-13T04:42:34Z"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "meta.lastModified",
          type: "attrPath",
        },
        operator: "lt",
        type: "comparison",
        value: "2011-05-13T04:42:34Z",
      })
    })

    it("parses less or equal", () => {
      const ast = parseFilter('meta.lastModified le "2011-05-13T04:42:34Z"')
      expect(ast).toStrictEqual({
        attribute: {
          path: "meta.lastModified",
          type: "attrPath",
        },
        operator: "le",
        type: "comparison",
        value: "2011-05-13T04:42:34Z",
      })
    })

    it("parses and expression", () => {
      const ast = parseFilter('title pr and userType eq "Employee"')
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "title",
            type: "attrPath",
          },
          type: "present",
        },
        operator: "and",
        right: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "Employee",
        },
        type: "logical",
      })
    })

    it("parses or expression", () => {
      const ast = parseFilter('title pr or userType eq "Intern"')
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "title",
            type: "attrPath",
          },
          type: "present",
        },
        operator: "or",
        right: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "Intern",
        },
        type: "logical",
      })
    })

    it("parses long schema filter", () => {
      const ast = parseFilter(
        'schemas eq "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"',
      )
      expect(ast).toStrictEqual({
        attribute: {
          path: "schemas",
          type: "attrPath",
        },
        operator: "eq",
        type: "comparison",
        value: "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
      })
    })

    it("parses and with grouped or", () => {
      const ast = parseFilter(
        'userType eq "Employee" and (emails co "example.com" or emails.value co "example.org")',
      )
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "Employee",
        },
        operator: "and",
        right: {
          left: {
            attribute: {
              path: "emails",
              type: "attrPath",
            },
            operator: "co",
            type: "comparison",
            value: "example.com",
          },
          operator: "or",
          right: {
            attribute: {
              path: "emails.value",
              type: "attrPath",
            },
            operator: "co",
            type: "comparison",
            value: "example.org",
          },
          type: "logical",
        },
        type: "logical",
      })
    })

    it("parses and with not and grouped or", () => {
      const ast = parseFilter(
        'userType ne "Employee" and not (emails co "example.com" or emails.value co "example.org")',
      )
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "ne",
          type: "comparison",
          value: "Employee",
        },
        operator: "and",
        right: {
          expression: {
            left: {
              attribute: {
                path: "emails",
                type: "attrPath",
              },
              operator: "co",
              type: "comparison",
              value: "example.com",
            },
            operator: "or",
            right: {
              attribute: {
                path: "emails.value",
                type: "attrPath",
              },
              operator: "co",
              type: "comparison",
              value: "example.org",
            },
            type: "logical",
          },
          type: "not",
        },
        type: "logical",
      })
    })

    it("parses and with grouped sub-attr", () => {
      const ast = parseFilter(
        'userType eq "Employee" and (emails.type eq "work")',
      )
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "Employee",
        },
        operator: "and",
        right: {
          attribute: {
            path: "emails.type",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "work",
        },
        type: "logical",
      })
    })

    it("parses valuePath with and inside", () => {
      const ast = parseFilter(
        'userType eq "Employee" and emails[type eq "work" and value co "@example.com"]',
      )
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "userType",
            type: "attrPath",
          },
          operator: "eq",
          type: "comparison",
          value: "Employee",
        },
        operator: "and",
        right: {
          attribute: {
            path: "emails",
            type: "attrPath",
          },
          filter: {
            left: {
              attribute: {
                path: "type",
                type: "attrPath",
              },
              operator: "eq",
              type: "comparison",
              value: "work",
            },
            operator: "and",
            right: {
              attribute: {
                path: "value",
                type: "attrPath",
              },
              operator: "co",
              type: "comparison",
              value: "@example.com",
            },
            type: "logical",
          },
          type: "valuePath",
        },
        type: "logical",
      })
    })

    it("parses or between valuePaths", () => {
      const ast = parseFilter(
        'emails[type eq "work" and value co "@example.com"] or ims[type eq "xmpp" and value co "@foo.com"]',
      )
      expect(ast).toStrictEqual({
        left: {
          attribute: {
            path: "emails",
            type: "attrPath",
          },
          filter: {
            left: {
              attribute: {
                path: "type",
                type: "attrPath",
              },
              operator: "eq",
              type: "comparison",
              value: "work",
            },
            operator: "and",
            right: {
              attribute: {
                path: "value",
                type: "attrPath",
              },
              operator: "co",
              type: "comparison",
              value: "@example.com",
            },
            type: "logical",
          },
          type: "valuePath",
        },
        operator: "or",
        right: {
          attribute: {
            path: "ims",
            type: "attrPath",
          },
          filter: {
            left: {
              attribute: {
                path: "type",
                type: "attrPath",
              },
              operator: "eq",
              type: "comparison",
              value: "xmpp",
            },
            operator: "and",
            right: {
              attribute: {
                path: "value",
                type: "attrPath",
              },
              operator: "co",
              type: "comparison",
              value: "@foo.com",
            },
            type: "logical",
          },
          type: "valuePath",
        },
        type: "logical",
      })
    })
  })

  describe("#evaluateFilter", () => {
    const baseUser = {
      userName: "bjensen",
      name: {familyName: "O'Malley"},
      title: "Manager",
      meta: {lastModified: "2011-05-14T04:42:34Z"},
      userType: "Employee",
      emails: [
        {type: "work", value: "bjensen@example.com"},
        {type: "home", value: "bjensen@example.org"},
      ],
      employeeId: "ABC123",
    }

    it("matches basic equality", () => {
      const ast = parseFilter('userName eq "bjensen"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("allows case insensitive equality, on attributes marked as caseExact false", () => {
      const ast = parseFilter('userName eq "BJENSEN"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches case-insensitive substring match", () => {
      const ast = parseFilter('name.familyName co "malley"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches mixed-case substring", () => {
      const ast = parseFilter('name.familyName co "Malley"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches upper-case substring due to caseExact: false", () => {
      const ast = parseFilter('name.familyName co "MALLEY"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches presence check", () => {
      const ast = parseFilter("title pr")
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches gt date", () => {
      const ast = parseFilter('meta.lastModified gt "2011-05-13T00:00:00Z"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches lt date", () => {
      const ast = parseFilter('meta.lastModified lt "2011-05-15T00:00:00Z"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches logical and", () => {
      const ast = parseFilter('title pr and userType eq "Employee"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches logical or", () => {
      const ast = parseFilter('title pr or userType eq "Intern"')
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches valuePath filter", () => {
      const ast = parseFilter(
        'emails[type eq "work" and value co "@example.com"]',
      )
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches valuePath with uppercase domain (case-insensitive)", () => {
      const ast = parseFilter(
        'emails[type eq "work" and value co "@EXAMPLE.COM"]',
      )
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches complex subattribute expressions", () => {
      const ast = parseFilter(
        'emails[type eq "work" and value co "@EXAMPLE.COM"]',
      )
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("matches not with nested or", () => {
      const ast = parseFilter(
        'userType ne "Intern" and not (emails.value co "example.net")',
      )
      expect(evaluateFilter(ast, baseUser, ScimSchemaCoreUser)).toBe(true)
    })

    it("rejects case sensitive attributes when case doesn't match", () => {
      const ast = parseFilter('employeeId eq "abc123"')
      expect(
        evaluateFilter(ast, baseUser, {
          ...ScimSchemaCoreUser,
          attributes: [
            ...ScimSchemaCoreUser.attributes,
            {name: "employeeId", caseExact: true},
          ],
        }),
      ).toBe(false)
    })

    it("accepts case sensitive attributes when case does match", () => {
      const ast = parseFilter('employeeId eq "ABC123"')
      expect(
        evaluateFilter(ast, baseUser, {
          ...ScimSchemaCoreUser,
          attributes: [
            ...ScimSchemaCoreUser.attributes,
            {name: "employeeId", caseExact: true},
          ],
        }),
      ).toBe(true)
    })
  })
})
