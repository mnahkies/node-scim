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

export const getScimV2Users: GetScimV2Users = async ({query}, respond) => {
  const users = await firebase.listUsers()

  return respond.with200().body({
    itemsPerPage: users.length,
    resources: users.map(
      (it): t_User => ({
        id: it.uid,
        active: !it.disabled,
        emails: [],
        groups: [],
        meta: {
          resourceType: "User",
        },
        name: {
          familyName: undefined,
          formatted: undefined,
          givenName: undefined,
          honorificPrefix: undefined,
          honorificSuffix: undefined,
          middleName: undefined,
        },
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        userName: it.email ?? "",
      }),
    ),
    schemas: [],
    startIndex: 0,
    totalResults: users.length,
  })
}
export const getScimV2UsersId: GetScimV2UsersId = async ({query}, respond) => {
  return notImplemented({}, respond)
}
export const postScimV2Users: PostScimV2Users = async ({query}, respond) => {
  return notImplemented({}, respond)
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
