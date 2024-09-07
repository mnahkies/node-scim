import type {UserRecord} from "firebase-admin/auth"
import type {t_User} from "../generated/models"
import {
  type DeleteScimV2UsersId,
  type GetScimV2Users,
  type GetScimV2UsersId,
  type PatchScimV2UsersId,
  type PostScimV2Users,
  type PutScimV2UsersId,
  createRouter,
} from "../generated/routes/users"
import {firebase} from "../services/services"
import {notImplemented} from "../utils"

function mapFirebaseUserToScimUserResource(user: UserRecord): t_User {
  console.info(JSON.stringify(user, undefined, 2))

  return {
    id: user.uid,
    active: !user.disabled,
    emails: [],
    groups: [],
    meta: {
      resourceType: "User",
    },
    name: {
      familyName: undefined,
      formatted: user.displayName,
      givenName: undefined,
      honorificPrefix: undefined,
      honorificSuffix: undefined,
      middleName: undefined,
    },
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    userName: user.email ?? "",
  }
}

export const getScimV2Users: GetScimV2Users = async ({query}, respond) => {
  const users = await firebase.listUsers()

  return respond.with200().body({
    itemsPerPage: users.length,
    resources: users.map(mapFirebaseUserToScimUserResource),
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

  return respond.with200().body(mapFirebaseUserToScimUserResource(user))
}

export const postScimV2Users: PostScimV2Users = async ({body}, respond) => {
  const primaryEmail =
    body.emails.find((it) => it.primary) ||
    (body.emails.length === 1 && body.emails[0])

  if (!primaryEmail) {
    throw new Error("must provide a primary email")
  }

  const displayName = body.displayName || body.name.formatted || "Unknown"

  const user = await firebase.createUser({
    email: primaryEmail.value,
    externalId: body.externalId,
    displayName,
    disabled: !body.active,
  })

  return respond.with201().body(mapFirebaseUserToScimUserResource(user))
}

export const putScimV2UsersId: PutScimV2UsersId = async ({query}, respond) => {
  return notImplemented({}, respond)
}

export const patchScimV2UsersId: PatchScimV2UsersId = async (
  {query},
  respond,
) => {
  return notImplemented({}, respond)
}

export const deleteScimV2UsersId: DeleteScimV2UsersId = async (
  {query},
  respond,
) => {
  return notImplemented({}, respond)
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
