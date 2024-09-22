import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import type {Context, Middleware, Next} from "koa"
import {ZodError} from "zod"
export function errorMiddleware(): Middleware {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next()
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      if (
        KoaRuntimeError.isKoaError(err) &&
        err.phase === "request_validation"
      ) {
        console.warn("invalid request", err)
        ctx.status = 400
        ctx.response.headers["content-type"] = "application/json"
        ctx.body = JSON.stringify(
          {
            error: "validation failed",
            err: err.cause instanceof ZodError ? err.cause.errors : err,
          },
          undefined,
          2,
        )
      } else {
        console.log("error handling request", err)
        ctx.status = 500
        ctx.response.headers["content-type"] = "application/json"
        ctx.body = JSON.stringify(
          {
            error: "internal server error",
            err: {
              message: err.message,
              stack: err.stack,
              cause: err.cause && {
                message: err.cause.message,
                stack: err.cause.stack,
              },
            },
          },
          undefined,
          2,
        )
      }
    }
  }
}
