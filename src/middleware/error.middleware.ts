import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import type {Context, Middleware, Next} from "koa"
import {
  DomainError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../errors"
export function errorMiddleware(): Middleware {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next()

      if (ctx.status === 404) {
        throw new NotFoundError(ctx.url)
      }

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      const cause = err.cause || err

      if (
        KoaRuntimeError.isKoaError(err) &&
        err.phase === "request_validation"
      ) {
        return doErrorResponse(ctx, new ValidationError(cause))
      }

      if (cause instanceof DomainError) {
        return doErrorResponse(ctx, cause)
      }

      return doErrorResponse(ctx, new InternalServerError(cause))
    }
  }
}

function doErrorResponse(ctx: Context, err: DomainError<string, unknown>) {
  console.log("error handling request", err)

  ctx.status = err.statusCode
  ctx.set("Content-Type", "application/json")
  ctx.body = JSON.stringify(err, undefined, 2)
}
