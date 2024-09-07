import {createRouter} from "../generated/routes/users"
import {notImplemented} from "../utils"

export function createUsersRouter() {
  return createRouter({
    getScimV2Users: notImplemented,
    getScimV2UsersId: notImplemented,
    postScimV2Users: notImplemented,
    putScimV2UsersId: notImplemented,
    patchScimV2UsersId: notImplemented,
    deleteScimV2UsersId: notImplemented,
  })
}
