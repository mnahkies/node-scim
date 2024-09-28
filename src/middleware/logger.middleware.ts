import type {Context, Middleware, Next} from "koa"

export function loggerMiddleware(): Middleware {
  return async function loggerMiddleware(ctx: Context, next: Next) {
    // todo; reduce logging / don't log bodies
    console.info(
      `request started \n${JSON.stringify(
        {
          method: ctx.method,
          url: ctx.request.url,
          query: ctx.request.query,
          body: ctx.request.body,
          headers: ctx.request.headers,
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
          headers: ctx.response.headers,
        },
        undefined,
        4,
      )}`,
    )
  }
}
