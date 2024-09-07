import type {Context, Middleware, Next} from "koa"

export function loggerMiddleware(): Middleware {
  return async function loggerMiddleware(ctx: Context, next: Next) {
    console.info("request started", {url: ctx.request.url})
    await next()
    console.info("request complete", {url: ctx.request.url, status: ctx.status})
  }
}
