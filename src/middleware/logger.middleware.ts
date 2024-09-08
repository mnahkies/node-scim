import type {Context, Middleware, Next} from "koa"

export function loggerMiddleware(): Middleware {
  return async function loggerMiddleware(ctx: Context, next: Next) {
    console.info(
      `request started \n${JSON.stringify(
        {
          method: ctx.method,
          url: ctx.request.url,
          query: ctx.request.query,
          body: ctx.request.body,
        },
        undefined,
        4,
      )}`,
    )

    await next()

    console.info(
      `request complete\n${JSON.stringify(
        {
          method: ctx.method,
          url: ctx.request.url,
          status: ctx.status,
          body: ctx.body,
        },
        undefined,
        4,
      )}`,
    )
  }
}
