import type {KoaRuntimeResponder} from "@nahkies/typescript-koa-runtime/server"
// @ts-ignore
import {parse} from "../parser.js"

export async function notImplemented(_: unknown, respond: KoaRuntimeResponder) {
  return respond.withStatus(501)
}

export function parseFilter(filter: string): {
  left: string
  right: string
  operator: "eq" | "ne" | "co" | "sw" | "ew" | "gt" | "lt" | "ge" | "le"
} {
  return parse(filter)
}
