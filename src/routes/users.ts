import {z} from "zod"

import {ValidationError} from "../errors"
import type {
  t_CreateUser,
  t_PutScimV2UsersIdBodySchema,
} from "../generated/models"
import {
  type DeleteScimV2UsersId,
  type GetScimV2Users,
  type GetScimV2UsersId,
  type PatchScimV2UsersId,
  type PostScimV2Users,
  type PutScimV2UsersId,
  createRouter,
} from "../generated/routes/users"
import {firebase} from "../idp-adapters/idp-adapters"
import type {CreateUser} from "../idp-adapters/types"
import {parseFilter} from "../utils"

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

export const getScimV2Users: GetScimV2Users = async ({query}, respond) => {
  let users = await firebase.listUsers()

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

export const getScimV2UsersId: GetScimV2UsersId = async (
  {params, query},
  respond,
) => {
  const user = await firebase.getUser(params.id)

  return respond.with200().body(user)
}

export const postScimV2Users: PostScimV2Users = async ({body}, respond) => {
  const user = await firebase.createUser(requestBodyToCreateUser(body))
  return respond.with201().body(user)
}

export const putScimV2UsersId: PutScimV2UsersId = async (
  {params, body},
  respond,
) => {
  const user = await firebase.updateUser(
    params.id,
    requestBodyToCreateUser(body),
  )
  return respond.with200().body(user)
}

export const patchScimV2UsersId: PatchScimV2UsersId = async (
  {params},
  respond,
) => {
  const user = await firebase.getUser(params.id)
  //TODO: implement
  return respond.with200().body(user)
}

export const deleteScimV2UsersId: DeleteScimV2UsersId = async (
  {params},
  respond,
) => {
  await firebase.deleteUser(params.id)

  return respond.with204().body()
}

export function createUsersRouter() {
  return createRouter({
    getScimV2Users,
    getScimV2UsersId,
    postScimV2Users,
    putScimV2UsersId,
    patchScimV2UsersId,
    deleteScimV2UsersId,
  })
}
