import crypto from "node:crypto"
import type {Context, Middleware, Next} from "koa"

export function authenticationMiddleware({
  secretKey,
}: {
  secretKey: Buffer
}): Middleware {
  return async function authenticationMiddleware(ctx: Context, next: Next) {
    const authorization = ctx.headers.authorization

    if (!authorization) {
      console.warn("missing authorization header")
      return respond401(ctx)
    }

    const token = authorization.split("Bearer ")[1]

    if (!token) {
      console.warn("missing bearer token")
      return respond401(ctx)
    }

    const buffer = Buffer.from(token, "utf-8")

    if (buffer.length !== secretKey.length) {
      console.warn("buffers of different length")
      return respond401(ctx)
    }

    const isMatch = crypto.timingSafeEqual(buffer, secretKey)

    if (!isMatch) {
      console.warn("secret key does not match")
      return respond401(ctx)
    }

    await next()
  }
}

function respond401(ctx: Context) {
  ctx.status = 401
  ctx.body = {error: "unauthorized"}
}
