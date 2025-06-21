import KoaRouter from "@koa/router"
import {Service} from "diod"
import {Config} from "../config"
import {
  createGroupsRouter,
  GroupsImplementation,
} from "../generated/routes/groups"
import {
  createIntrospectionRouter,
  IntrospectionImplementation,
} from "../generated/routes/introspection"
import {createUsersRouter, UsersImplementation} from "../generated/routes/users"
import {authenticationMiddleware} from "../middleware/authentication.middleware"

@Service()
export class AuthenticatedRouterFactory {
  constructor(
    private readonly config: Config,
    private readonly usersImplementation: UsersImplementation,
    private readonly groupsImplementation: GroupsImplementation,
    private readonly introspectionImplementation: IntrospectionImplementation,
  ) {}

  create(): KoaRouter {
    const router = new KoaRouter()

    router.use(authenticationMiddleware({secretKey: this.config.secretKey}))

    const usersRouter = createUsersRouter(this.usersImplementation)
    const groupsRouter = createGroupsRouter(this.groupsImplementation)
    const introspectionRouter = createIntrospectionRouter(
      this.introspectionImplementation,
    )

    router.use(usersRouter.routes(), usersRouter.allowedMethods())
    router.use(groupsRouter.routes(), groupsRouter.allowedMethods())
    router.use(
      introspectionRouter.routes(),
      introspectionRouter.allowedMethods(),
    )

    return router
  }
}
