import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import KoaRouter from "@koa/router"
import Koa from "koa"
import {config} from "./config"
import {authenticationMiddleware} from "./middleware/authentication.middleware"
import {bodyMiddleware} from "./middleware/body.middleware"
import {errorMiddleware} from "./middleware/error.middleware"
import {loggerMiddleware} from "./middleware/logger.middleware"
import {createGroupsRouter} from "./routes/groups"
import {createIntrospectionRouter} from "./routes/introspection"
import {createUsersRouter} from "./routes/users"
export async function main(): Promise<{
  app: Koa
  server: Server
  address: AddressInfo
}> {
  const app = new Koa()

  app.use(loggerMiddleware())
  app.use(errorMiddleware())
  app.use(bodyMiddleware())
  app.use(authenticationMiddleware({secretKey: config.secretKey}))

  const router = new KoaRouter()

  router.get("/", (ctx) => {
    ctx.status = 200
    ctx.body = {status: "running"}
  })

  const usersRouter = createUsersRouter()
  const groupsRouter = createGroupsRouter()
  const introspectionRouter = createIntrospectionRouter()

  router.use(usersRouter.routes(), usersRouter.allowedMethods())
  router.use(groupsRouter.routes(), groupsRouter.allowedMethods())
  router.use(introspectionRouter.routes(), introspectionRouter.allowedMethods())

  app.use(router.allowedMethods())
  app.use(router.routes())

  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(config.port)

      server.once("listening", () => {
        try {
          const address = server.address()

          if (!address || typeof address !== "object") {
            throw new Error("failed to bind port")
          }

          resolve({app, server, address})
        } catch (err) {
          reject(err)
        }
      })

      server.once("error", (err) => {
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

if (require.main === module) {
  main()
    .then(({address}) => {
      console.info(`listening on ${address.address}:${address.port}`)
    })
    .catch((err) => {
      console.error("fatal error during startup", err)
      process.exit(1)
    })
}
