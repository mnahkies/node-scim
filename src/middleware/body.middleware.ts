import coBody from "co-body"
import type {Middleware} from "koa"
import koaBody from "koa-body"

export function bodyMiddleware(): Middleware {
  koaBody() // todo; adds the body to request type
  return async (ctx, next) => {
    if (
      ctx.get("Content-Type").includes("application/scim+json") ||
      ctx.get("Content-Type").includes("application/json")
    ) {
      const body = await coBody.json(ctx, {
        encoding: "utf-8", // todo; read encoding from header
      })

      ctx.request.body = body
    }

    await next()

    if (ctx.get("Accept").includes("application/scim+json")) {
      console.info("overriding content type")
      ctx.body =
        typeof ctx.body === "string"
          ? ctx.body
          : JSON.stringify(ctx.body, undefined, 2) // todo; remove pretty printing
      ctx.set("Content-Type", "application/scim+json")
    }
  }
}
