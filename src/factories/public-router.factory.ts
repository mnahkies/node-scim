import KoaRouter from "@koa/router"
import {Service} from "diod"
import {createDocsRouter} from "../routes/docs"

@Service()
export class PublicRouterFactory {
  create(): KoaRouter {
    const router = new KoaRouter()

    router.get("/", (ctx) => {
      ctx.status = 200
      ctx.body = {status: "running"}
    })

    const docsRouter = createDocsRouter()
    router.use(docsRouter.routes(), docsRouter.allowedMethods())

    return router
  }
}
