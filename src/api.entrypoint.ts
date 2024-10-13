import "reflect-metadata"

import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import KoaRouter from "@koa/router"
import {ContainerBuilder} from "diod"
import Koa from "koa"
import {Config} from "./config"
import {GroupsRepository} from "./database/groups-repository"
import {
  Implementation as GroupsImplementation,
  createRouter as createGroupsRouter,
} from "./generated/routes/groups"
import {
  Implementation as IntrospectionImplementation,
  createRouter as createIntrospectionRouter,
} from "./generated/routes/introspection"
import {
  Implementation as UsersImplementation,
  createRouter as createUsersRouter,
} from "./generated/routes/users"
import {FirebaseAuthService} from "./idp-adapters/firebase"
import {IdpAdapter} from "./idp-adapters/types"
import {authenticationMiddleware} from "./middleware/authentication.middleware"
import {bodyMiddleware} from "./middleware/body.middleware"
import {errorMiddleware} from "./middleware/error.middleware"
import {loggerMiddleware} from "./middleware/logger.middleware"
import {createDocsRouter} from "./routes/docs"
import {GroupsHandlers} from "./routes/groups"
import {IntrospectionHandlers} from "./routes/introspection"
import {UsersHandlers} from "./routes/users"
import {ReferenceManager} from "./utils"

function di() {
  const builder = new ContainerBuilder()

  builder.registerAndUse(Config).asSingleton()
  builder.registerAndUse(ReferenceManager)

  builder.registerAndUse(GroupsRepository)
  builder.register(IdpAdapter).use(FirebaseAuthService)

  builder.register(UsersImplementation).use(UsersHandlers)
  builder.register(GroupsImplementation).use(GroupsHandlers)
  builder.register(IntrospectionImplementation).use(IntrospectionHandlers)

  return builder.build()
}

export async function main(): Promise<{
  app: Koa
  server: Server
  address: AddressInfo
}> {
  const container = di()

  const config = container.get(Config)

  const idpAdapter = container.get(IdpAdapter)
  await idpAdapter.checkAuth()

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

  const usersRouter = createUsersRouter(container.get(UsersImplementation))
  const groupsRouter = createGroupsRouter(container.get(GroupsImplementation))
  const introspectionRouter = createIntrospectionRouter(
    container.get(IntrospectionImplementation),
  )

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
