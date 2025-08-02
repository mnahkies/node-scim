import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import type {Context, Middleware, Next} from "koa"
import {
  DomainError,
  InternalServerError,
  InvalidSyntaxError,
  NotFoundError,
} from "../errors"

export function errorMiddleware(): Middleware {
  return async function errorMiddleware(ctx: Context, next: Next) {
    try {
      await next()

      if (ctx.status === 404) {
        throw new NotFoundError(ctx.url)
      }
    } catch (err: unknown) {
      const cause = (err instanceof Error && err.cause) || err

      if (!(cause instanceof Error)) {
        return doErrorResponse(
          ctx,
          new InternalServerError(new Error("an non-error was thrown")),
        )
      }

      if (
        KoaRuntimeError.isKoaError(err) &&
        err.phase === "request_validation"
      ) {
        return doErrorResponse(ctx, new InvalidSyntaxError(cause))
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

  if (ctx.get("Accept") === "application/scim+json") {
    ctx.set("Content-Type", "application/scim+json")
  } else {
    ctx.set("Content-Type", "application/json")
  }

  ctx.body = JSON.stringify(err, undefined, 2)
}
