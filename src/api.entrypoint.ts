import "reflect-metadata"

import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import {ContainerBuilder} from "diod"
import Koa from "koa"
import {Config} from "./config"
import {GroupsRepository} from "./database/groups-repository"
import {ApplicationFactory} from "./factories/application.factory"
import {AuthenticatedRouterFactory} from "./factories/authenticated-router.factory"
import {PublicRouterFactory} from "./factories/public-router.factory"
import {GroupsImplementation} from "./generated/routes/groups"
import {IntrospectionImplementation} from "./generated/routes/introspection"
import {UsersImplementation} from "./generated/routes/users"
import {FirebaseAuthService} from "./idp-adapters/firebase"
import {IdpAdapter} from "./idp-adapters/types"
import {GroupsHandlers} from "./routes/groups"
import {IntrospectionHandlers} from "./routes/introspection"
import {UsersHandlers} from "./routes/users"
import {ReferenceFactory} from "./utils/reference-factory"

export function createContainerBuilder() {
  const builder = new ContainerBuilder()

  builder.registerAndUse(Config).asSingleton()
  builder.registerAndUse(ReferenceFactory)

  builder.registerAndUse(GroupsRepository).asSingleton()

  builder.register(IdpAdapter).use(FirebaseAuthService).asSingleton()

  builder.register(UsersImplementation).use(UsersHandlers)
  builder.register(GroupsImplementation).use(GroupsHandlers)
  builder.register(IntrospectionImplementation).use(IntrospectionHandlers)

  builder.registerAndUse(PublicRouterFactory)
  builder.registerAndUse(AuthenticatedRouterFactory)

  builder.registerAndUse(ApplicationFactory)

  return builder
}

export async function main(): Promise<{
  app: Koa
  server: Server
  address: AddressInfo
}> {
  const builder = createContainerBuilder()
  const container = builder.build()
  return container.get(ApplicationFactory).start()
}

if (require.main === module) {
  main()
    .then(({address, server}) => {
      console.info(`listening on ${address.address}:${address.port}`)

      const signals = ["SIGTERM", "SIGUSR2"] as const

      signals.map((signal) =>
        process.on(signal, () => {
          console.info(`received '${signal}', closing`)

          server.close((err) => {
            if (err) {
              console.error("failed to cleanly close server", err)
              process.exit(1)
            }
            process.exit(0)
          })
        }),
      )
    })
    .catch((err) => {
      console.error("fatal error during startup", err)
      process.exit(1)
    })
}
