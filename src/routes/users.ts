import {z} from "zod"

import {Service} from "diod"
import {ValidationError} from "../errors"
import type {
  t_CreateUser,
  t_PutScimV2UsersIdBodySchema,
} from "../generated/models"
import type {
  DeleteScimV2UsersId,
  GetScimV2Users,
  GetScimV2UsersId,
  Implementation,
  PatchScimV2UsersId,
  PostScimV2Users,
  PutScimV2UsersId,
} from "../generated/routes/users"
// biome-ignore lint/style/useImportType: needed for DI
import {CreateUser, IdpAdapter} from "../idp-adapters/types"
import {parseFilter, performPatchOperation} from "../utils"

const requestBodyToCreateUser = (
  body: t_CreateUser | t_PutScimV2UsersIdBodySchema,
): CreateUser => {
  const primaryEmail = body.emails.find((it) => it.primary) ||
    body.emails[0] || {value: body.userName}

  if (!primaryEmail) {
    throw new ValidationError(new Error("must provide at least one email"))
  }

  if (!z.string().email().safeParse(primaryEmail.value).data) {
    throw new ValidationError(
      new Error(`invalid primary email '${primaryEmail.value}'`),
    )
  }

  const externalId = body.externalId || body.userName

  const displayName = body.displayName || body.name?.formatted || "Unknown"

  return {
    email: primaryEmail.value,
    externalId,
    displayName,
    disabled: !body.active,
  }
}

@Service()
export class UsersHandlers implements Implementation {
  constructor(private readonly firebase: IdpAdapter) {}

  getScimV2Users: GetScimV2Users = async ({query}, respond) => {
    const take = query.count
    const skip =
      query.startIndex !== undefined && query.count !== undefined
        ? (query.startIndex - 1) * query.count
        : 0

    let users = await this.firebase.listUsers({
      take,
      skip,
    })

    // todo; support filter properly
    if (query.filter) {
      const filter = parseFilter(query.filter)
      users = users.filter((it) => {
        switch (filter.operator) {
          case "eq":
            // @ts-ignore
            return it[filter.left].toLowerCase() === filter.right.toLowerCase()
          default:
            throw new Error("not supported")
        }
      })
    }

    return respond.with200().body({
      itemsPerPage: users.length,
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      Resources: users,
      startIndex: 0,
      totalResults: users.length,
    })
  }

  getScimV2UsersId: GetScimV2UsersId = async ({params, query}, respond) => {
    const user = await this.firebase.getUser(params.id)

    return respond.with200().body(user)
  }

  postScimV2Users: PostScimV2Users = async ({body}, respond) => {
    const user = await this.firebase.createUser(requestBodyToCreateUser(body))
    return respond.with201().body(user)
  }

  putScimV2UsersId: PutScimV2UsersId = async ({params, body}, respond) => {
    const user = await this.firebase.updateUser(
      params.id,
      requestBodyToCreateUser(body),
    )
    return respond.with200().body(user)
  }

  patchScimV2UsersId: PatchScimV2UsersId = async ({params, body}, respond) => {
    const user = await this.firebase.getUser(params.id)
    const operations = body.Operations ?? []

    let updated = {...user}
    for (const operation of operations) {
      updated = performPatchOperation(updated, operation)
    }

    await this.firebase.updateUser(user.id, requestBodyToCreateUser(updated))

    return respond.with200().body(user)
  }

  deleteScimV2UsersId: DeleteScimV2UsersId = async ({params}, respond) => {
    await this.firebase.deleteUser(params.id)

    return respond.with204().body()
  }
}
