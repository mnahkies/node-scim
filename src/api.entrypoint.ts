import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import KoaRouter from "@koa/router"
import Koa from "koa"
import {config} from "./config"
import {firebase} from "./idp-adapters/idp-adapters"
import {authenticationMiddleware} from "./middleware/authentication.middleware"
import {bodyMiddleware} from "./middleware/body.middleware"
import {errorMiddleware} from "./middleware/error.middleware"
import {loggerMiddleware} from "./middleware/logger.middleware"
import {createDocsRouter} from "./routes/docs"
import {createGroupsRouter} from "./routes/groups"
import {createIntrospectionRouter} from "./routes/introspection"
import {createUsersRouter} from "./routes/users"

export async function main(): Promise<{
  app: Koa
  server: Server
  address: AddressInfo
}> {
  await firebase.checkAuth()

  const app = new Koa()

  app.use(loggerMiddleware())
  app.use(errorMiddleware())
  app.use(bodyMiddleware())

  const publicRouter = new KoaRouter()

  publicRouter.get("/", (ctx) => {
    ctx.status = 200
    ctx.body = {status: "running"}
  })

  const docsRouter = createDocsRouter()
  publicRouter.use(docsRouter.routes(), docsRouter.allowedMethods())

  const authedRouter = new KoaRouter()

  authedRouter.use(authenticationMiddleware({secretKey: config.secretKey}))

  const usersRouter = createUsersRouter()
  const groupsRouter = createGroupsRouter()
  const introspectionRouter = createIntrospectionRouter()

  authedRouter.use(usersRouter.routes(), usersRouter.allowedMethods())
  authedRouter.use(groupsRouter.routes(), groupsRouter.allowedMethods())
  authedRouter.use(
    introspectionRouter.routes(),
    introspectionRouter.allowedMethods(),
  )

  app.use(publicRouter.allowedMethods())
  app.use(publicRouter.routes())
  app.use(authedRouter.allowedMethods())
  app.use(authedRouter.routes())

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
