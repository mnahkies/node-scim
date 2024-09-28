import {
  type GetScimV2Groups,
  type GetScimV2GroupsId,
  type PostScimV2Groups,
  type PutScimV2GroupsId,
  createRouter,
} from "../generated/routes/groups"
import {firebase} from "../idp-adapters/idp-adapters"
import {notImplemented, parseFilter} from "../utils"

const postScimV2Groups: PostScimV2Groups = async ({body}, respond) => {
  const group = await firebase.createGroup(body)
  return respond.with201().body(group)
}

const putScimV2GroupsId: PutScimV2GroupsId = async ({body}, respond) => {
  // TODO: actually update
  const group = await firebase.createGroup(body)
  return respond.with200().body(group)
}

const getScimV2Groups: GetScimV2Groups = async ({query}, respond) => {
  let groups = await firebase.listGroups()

  // todo; support filter properly
  if (query.filter) {
    const filter = parseFilter(query.filter)
    groups = groups.filter((it) => {
      switch (filter.operator) {
        case "eq":
          // @ts-ignore
          return it[filter.left] === filter.right
        default:
          throw new Error("not supported")
      }
    })
  }

  return respond.with200().body({
    itemsPerPage: groups.length,
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    Resources: groups,
    startIndex: 0,
    totalResults: groups.length,
  })
}

const getScimV2GroupsId: GetScimV2GroupsId = async ({params}, respond) => {
  const group = await firebase.getGroup(params.id)
  return respond.with200().body(group)
}

export function createGroupsRouter() {
  return createRouter({
    getScimV2Groups,
    postScimV2Groups,
    getScimV2GroupsId,
    putScimV2GroupsId,
    patchScimV2GroupsId: notImplemented,
    deleteScimV2GroupsId: notImplemented,
  })
}
