import {parse} from "../parser.js"
import {PatchError} from "./errors"
import type {t_PatchOperation} from "./generated/models"
import {SchemaAttribute, ScimSchema} from "./scim-schemas"

export type FilterOperator =
  | "eq"
  | "ne"
  | "co"
  | "sw"
  | "ew"
  | "gt"
  | "lt"
  | "ge"
  | "le"

export type FilterLogicalOperator = "and" | "or"

export type FilterAttribute = {
  path: string
  type: "attrPath"
}

export type FilterPresent = {
  attribute: FilterAttribute
  type: "present"
}

export type FilterLogical = {
  type: "logical"
  operator: FilterLogicalOperator
  left: FilterAST
  right: FilterAST
}

export type FilterComparison = {
  type: "comparison"
  operator: FilterOperator
  value: string
  attribute: FilterAttribute
}

export type FilterNot = {
  type: "not"
  expression: FilterAST
}

export type FilterValuePath = {
  type: "valuePath"
  attribute: FilterAttribute
  filter: FilterAST
}

export type FilterAST =
  | FilterPresent
  | FilterComparison
  | FilterLogical
  | FilterNot
  | FilterValuePath

export function parseFilter(filter: string): FilterAST {
  return parse(filter, undefined)
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function resolveAttrPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

function isCaseExactForPath(
  schema: ScimSchema,
  attributePath: string,
): boolean {
  const [head, ...rest] = attributePath.split(".")

  let current = schema.attributes.find((it) => it.name === head)

  for (const part of rest) {
    current = current?.subAttributes?.find((it) => it.name === part)

    if (!current) {
      break
    }
  }

  return current?.caseExact ?? false
}

function matchComparison(
  operator: FilterOperator,
  left: string | number,
  right: string | number,
  // TODO: apply caseInsensitive based on schema "caseExact"
  caseInsensitive = true,
): boolean {
  if (
    caseInsensitive &&
    typeof left === "string" &&
    typeof right === "string"
  ) {
    // biome-ignore lint/style/noParameterAssign: easier
    left = left.toLowerCase()
    // biome-ignore lint/style/noParameterAssign: easier
    right = right.toLowerCase()
  }

  switch (operator) {
    case "eq":
      return left === right
    case "ne":
      return left !== right
    case "co":
      return (
        typeof left === "string" &&
        typeof right === "string" &&
        left.includes(right)
      )
    case "sw":
      return (
        typeof left === "string" &&
        typeof right === "string" &&
        left.startsWith(right)
      )
    case "ew":
      return (
        typeof left === "string" &&
        typeof right === "string" &&
        left.endsWith(right)
      )
    case "gt":
      return left > right
    case "lt":
      return left < right
    case "ge":
      return left >= right
    case "le":
      return left <= right
    default:
      throw new Error(`Unknown operator "${operator}"`)
  }
}

export function evaluateFilter(
  ast: FilterAST,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  obj: any,
  schema: ScimSchema,
): boolean {
  switch (ast.type) {
    case "present": {
      const val = resolveAttrPath(obj, ast.attribute.path)
      return val !== undefined && val !== null
    }
    case "comparison": {
      const val = resolveAttrPath(obj, ast.attribute.path)
      const caseSensitive = !isCaseExactForPath(schema, ast.attribute.path)
      return matchComparison(ast.operator, val, ast.value, caseSensitive)
    }
    case "logical": {
      const left = evaluateFilter(ast.left, obj, schema)
      const right = evaluateFilter(ast.right, obj, schema)
      return ast.operator === "and" ? left && right : left || right
    }
    case "not": {
      return !evaluateFilter(ast.expression, obj, schema)
    }
    case "valuePath": {
      const collection = resolveAttrPath(obj, ast.attribute.path)

      if (!Array.isArray(collection)) {
        return false
      }

      return collection.some((item) => evaluateFilter(ast.filter, item, schema))
    }

    default: {
      // @ts-expect-error: exhaustive check
      throw new Error(`unsupported type '${ast.type}' `)
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getType(obj: any, value: any) {
  if (Array.isArray(obj) && Array.isArray(value)) {
    return "multi-value"
  }

  if (typeof obj === "object" && typeof value === "object") {
    return "complex"
  }

  return "single-value"
}

export function performPatchOperation(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  obj: any,
  operation: t_PatchOperation,
  schema: ScimSchema,
) {
  const op = operation.op
  const path = operation.path ?? ""
  const value = operation.value

  const filteredPath = /^(\w+)\[(.+)\]$/
  const parts = path.split(".")

  const lastPart = parts.pop()
  const match = lastPart ? lastPart.match(filteredPath) : null

  if (!lastPart && op === "remove") {
    throw new PatchError(
      "must specify a path on 'remove' operations",
      "noTarget",
    )
  }

  if (!lastPart) {
    if (typeof value === "object" && !Array.isArray(value)) {
      switch (op) {
        case "add":
        case "replace": {
          const result = {...obj, ...value}

          // todo: hack: we store email and userName in the same field in the firebase adapter...
          //             this should also be done in reverse, eg: updating email updates userName
          if (value.userName) {
            result.emails = result.emails ?? []

            if (result.emails.length === 0) {
              result.emails.push({value: value.userName})
            } else {
              result.emails[0].value = value.userName
            }
          }

          return result
        }
      }
    }
    if (Array.isArray(obj) && Array.isArray(value)) {
      switch (op) {
        case "add":
          return [...obj, ...value]
        case "replace":
          throw new PatchError(
            "replacing array values not supported",
            "noTarget",
          )
      }
    }
    throw new PatchError(`No path provided and value is ${value}`, "noTarget")
  }

  let objToOperateOn = obj

  for (const part of parts) {
    if (filteredPath.test(part)) {
      if (!Array.isArray(objToOperateOn)) {
        throw new PatchError(
          `Filters like ${part} must be applied to arrays`,
          "invalidPath",
        )
      }
      const filterAst = parseFilter(part)
      objToOperateOn = objToOperateOn.filter((it) =>
        evaluateFilter(filterAst, it, schema),
      )
    } else {
      if (Reflect.get(obj, part) === undefined) {
        obj[part] = {}
      }
      objToOperateOn = Reflect.get(obj, part)
    }
  }

  const type = getType(objToOperateOn[lastPart], value)

  switch (op) {
    case "add":
      if (type === "complex") {
        objToOperateOn[lastPart] = {...objToOperateOn[lastPart], ...value}
      } else if (type === "multi-value") {
        objToOperateOn[lastPart] = [...objToOperateOn[lastPart], ...value]
      } else {
        objToOperateOn[lastPart] = value
      }
      break
    case "replace":
      if (type === "complex") {
        objToOperateOn[lastPart] = {...objToOperateOn[lastPart], ...value}
      } else if (type === "multi-value") {
        /*
        TODO: support filtered replace...
          If the target location is a multi-valued attribute and a value
          selection ("valuePath") filter is specified that matches one or
          more values of the multi-valued attribute, then all matching
          record values SHALL be replaced.
         */
        objToOperateOn[lastPart] = value
      } else if (type === "single-value") {
        objToOperateOn[lastPart] = value
      }
      break
    case "remove": {
      if (match) {
        const [_, attrName, rawFilter] = match

        if (!attrName || !rawFilter) {
          throw new PatchError(
            `invalid filter expression '${lastPart}'`,
            "invalidSyntax",
          )
        }

        const array = objToOperateOn[attrName]

        if (!Array.isArray(array)) {
          throw new PatchError(
            `Target '${attrName}' is not a multi-valued attribute`,
            "invalidPath",
          )
        }

        const filterAst = parseFilter(rawFilter)
        const filtered = array.filter(
          (it) => !evaluateFilter(filterAst, it, schema),
        )

        objToOperateOn[attrName] = filtered.length === 0 ? undefined : filtered
      } else {
        objToOperateOn[lastPart] = undefined
      }

      break
    }
  }

  return obj
}
