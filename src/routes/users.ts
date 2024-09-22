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
import {notImplemented} from "../utils"

export const getScimV2Users: GetScimV2Users = async ({query}, respond) => {
  const users = await firebase.listUsers()

  return respond.with200().body({
    itemsPerPage: users.length,
    resources: users,
    schemas: [],
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
  const primaryEmail =
    body.emails.find((it) => it.primary) ||
    (body.emails.length === 1 && body.emails[0])

  if (!primaryEmail) {
    throw new Error("must provide a primary email")
  }

  const externalId = body.externalId || body.userName

  const displayName = body.displayName || body.name?.formatted || "Unknown"

  const user = await firebase.createUser({
    email: primaryEmail.value,
    externalId,
    displayName,
    disabled: !body.active,
  })

  return respond.with201().body(user)
}

export const putScimV2UsersId: PutScimV2UsersId = async (
  {params, body},
  respond,
) => {
  // TODO: deduplicate
  const primaryEmail =
    body.emails.find((it) => it.primary) ||
    (body.emails.length === 1 && body.emails[0])

  if (!primaryEmail) {
    throw new Error("must provide a primary email")
  }

  const externalId = body.externalId || body.userName

  const displayName = body.displayName || body.name?.formatted || "Unknown"

  const user = await firebase.updateUser(params.id, {
    email: primaryEmail.value,
    externalId,
    displayName,
    disabled: !body.active,
  })

  return respond.with200().body(user)
}

export const patchScimV2UsersId: PatchScimV2UsersId = async (
  {query},
  respond,
) => {
  return notImplemented({}, respond)
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
