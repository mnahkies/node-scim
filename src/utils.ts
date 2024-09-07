import type {KoaRuntimeResponder} from "@nahkies/typescript-koa-runtime/server"

export async function notImplemented(_: unknown, respond: KoaRuntimeResponder) {
  return respond.withStatus(501)
}
