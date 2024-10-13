import {Service} from "diod"
import {parse} from "../parser.js"
// biome-ignore lint/style/useImportType: needed for DI
import {Config} from "./config"
import {PatchError} from "./errors"
import type {t_PatchOperation} from "./generated/models"

export function parseFilter(filter: string): {
  left: string
  right: string
  operator: "eq" | "ne" | "co" | "sw" | "ew" | "gt" | "lt" | "ge" | "le"
} {
  return parse(filter, undefined)
}

@Service()
export class ReferenceManager {
  constructor(private readonly config: Config) {}

  path(path: string) {
    return `https://${this.config.hostname}:${this.config.port}${path}`
  }

  create$Ref(id: string, type: "User" | "Group") {
    return this.path(`/scim/v2/${type}s/${id}`)
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getType(obj: any, value: any) {
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
) {
  const op = operation.op
  const path = operation.path ?? ""
  const value = operation.value

  const filteredPath = /.+\[(.+)]/
  const parts = path.split(".")

  const lastPart = parts.pop()

  if (filteredPath.test(lastPart ?? "")) {
    throw new PatchError(
      `Complex paths like '${lastPart}' not yet supported`,
      "invalidPath",
    )
  }

  if (!lastPart && op === "remove") {
    throw new PatchError(
      "must specify a path on 'remove' operatoins",
      "noTarget",
    )
  }

  if (!lastPart) {
    if (typeof value === "object" && !Array.isArray(value)) {
      switch (op) {
        case "add":
        case "replace":
          return {...obj, ...value}
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
      throw new PatchError(
        `Complex paths like '${lastPart}' not yet supported`,
        "invalidPath",
      )
    }

    if (Reflect.get(obj, part) === undefined) {
      obj[part] = {}
    }

    objToOperateOn = Reflect.get(obj, part)
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
    case "remove":
      /*
      TODO: support filtered remove...
        If the target location is a multi-valued attribute and a complex
        filter is specified comparing a "value", the values matched by the
        filter are removed.  If no other values remain after removal of
        the selected values, the multi-valued attribute SHALL be
        considered unassigned.
        If the target location is a complex multi-valued attribute and a
        complex filter is specified based on the attribute's
        sub-attributes, the matching records are removed.  Sub-attributes
        whose values have been removed SHALL be considered unassigned.  If
        the complex multi-valued attribute has no remaining records, the
        attribute SHALL be considered unassigned.
       */
      objToOperateOn[lastPart] = undefined
      break
  }

  return obj
}
