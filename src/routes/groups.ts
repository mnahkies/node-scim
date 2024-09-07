import {createRouter} from "../generated/routes/groups"
import {notImplemented} from "../utils"

export function createGroupsRouter() {
  return createRouter({
    getScimV2Groups: notImplemented,
    postScimV2Groups: notImplemented,
    getScimV2GroupsId: notImplemented,
    putScimV2GroupsId: notImplemented,
    patchScimV2GroupsId: notImplemented,
    deleteScimV2GroupsId: notImplemented,
  })
}
