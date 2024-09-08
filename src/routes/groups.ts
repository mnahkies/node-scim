import {
  type PostScimV2Groups,
  type PutScimV2GroupsId,
  createRouter,
} from "../generated/routes/groups"
import {firebase} from "../idp-adapters/idp-adapters"
import {notImplemented} from "../utils"

const postScimV2Groups: PostScimV2Groups = async ({body}, respond) => {
  const group = await firebase.createGroup(body)
  return respond.with201().body(group)
}

const putScimV2GroupsId: PutScimV2GroupsId = async ({body}, respond) => {
  // TODO: actually update
  const group = await firebase.createGroup(body)
  return respond.with200().body(group)
}

export function createGroupsRouter() {
  return createRouter({
    getScimV2Groups: notImplemented,
    postScimV2Groups,
    getScimV2GroupsId: notImplemented,
    putScimV2GroupsId,
    patchScimV2GroupsId: notImplemented,
    deleteScimV2GroupsId: notImplemented,
  })
}
