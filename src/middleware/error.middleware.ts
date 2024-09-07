import type {Context, Middleware, Next} from "koa"

export function errorMiddleware(): Middleware {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next()
    } catch (err) {
      console.log("error handling request", err)
      ctx.status = 500
      ctx.body = {error: "internal server error"}
    }
  }
}
