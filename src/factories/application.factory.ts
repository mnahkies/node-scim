import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import {Service} from "diod"
import Koa from "koa"
import {Config} from "../config"
import {IdpAdapter} from "../idp-adapters/types"
import {bodyMiddleware} from "../middleware/body.middleware"
import {errorMiddleware} from "../middleware/error.middleware"
import {loggerMiddleware} from "../middleware/logger.middleware"
import {AuthenticatedRouterFactory} from "./authenticated-router.factory"
import {PublicRouterFactory} from "./public-router.factory"

@Service()
export class ApplicationFactory {
  constructor(
    private readonly config: Config,
    private readonly idpAdapter: IdpAdapter,
    private readonly publicRouterFactory: PublicRouterFactory,
    private readonly authenticatedRouterFactory: AuthenticatedRouterFactory,
  ) {}

  async start(): Promise<{
    app: Koa
    server: Server
    address: AddressInfo
  }> {
    await this.idpAdapter.checkAuth()

    const app = this.createKoaApp()

    return new Promise((resolve, reject) => {
      try {
        const server = app.listen(this.config.port)

        server.once("listening", () => {
          try {
            const address = server.address()

            if (!address || typeof address !== "object") {
              throw new Error(`failed to bind port '${this.config.port}'`)
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

  private createKoaApp() {
    const app = new Koa()

    app.use(loggerMiddleware())
    app.use(errorMiddleware())
    app.use(bodyMiddleware())

    const publicRouter = this.publicRouterFactory.create()
    const authenticatedRouter = this.authenticatedRouterFactory.create()

    app.use(publicRouter.allowedMethods())
    app.use(publicRouter.routes())
    app.use(authenticatedRouter.allowedMethods())
    app.use(authenticatedRouter.routes())

    return app
  }
}
