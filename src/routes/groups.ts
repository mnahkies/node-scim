import {PatchError, ValidationError} from "../errors"
import {
  type DeleteScimV2GroupsId,
  type GetScimV2Groups,
  type GetScimV2GroupsId,
  type PatchScimV2GroupsId,
  type PostScimV2Groups,
  type PutScimV2GroupsId,
  createRouter,
} from "../generated/routes/groups"
import {firebase} from "../idp-adapters/idp-adapters"
import {notImplemented, parseFilter, performPatchOperation} from "../utils"

const postScimV2Groups: PostScimV2Groups = async ({body}, respond) => {
  const group = await firebase.createGroup(body)
  return respond.with201().body(group)
}

const putScimV2GroupsId: PutScimV2GroupsId = async (
  {params, body},
  respond,
) => {
  const group = await firebase.replaceGroup(params.id, body)
  return respond.with200().body(group)
}

const deleteScimV2GroupsId: DeleteScimV2GroupsId = async (
  {params},
  respond,
) => {
  await firebase.deleteGroup(params.id)
  return respond.with204().body()
}

const patchScimV2GroupsId: PatchScimV2GroupsId = async (
  {params, body},
  respond,
) => {
  const group = await firebase.getGroup(params.id)
  const operations = body.Operations ?? []

  let updated = {...group}
  for (const operation of operations) {
    updated = performPatchOperation(updated, operation)
  }

  await firebase.replaceGroup(group.id, updated)

  return respond.with200().body(updated)
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
          return it[filter.left].toLowerCase() === filter.right.toLowerCase()
        default:
          throw new Error("not supported")
      }
    })
  }

  if (query.excludedAttributes) {
    const excludedAttributes = query.excludedAttributes.split(",")
    for (const excludedAttribute of excludedAttributes) {
      for (const group of groups) {
        // @ts-ignore
        group[excludedAttribute] = undefined
      }
    }
  }

  return respond.with200().body({
    itemsPerPage: groups.length,
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    Resources: groups,
    startIndex: 0,
    totalResults: groups.length,
  })
}

const getScimV2GroupsId: GetScimV2GroupsId = async (
  {params, query},
  respond,
) => {
  const group = await firebase.getGroup(params.id)

  if (query.excludedAttributes) {
    const excludedAttributes = query.excludedAttributes.split(",")
    for (const excludedAttribute of excludedAttributes) {
      // @ts-ignore
      group[excludedAttribute] = undefined
    }
  }

  return respond.with200().body(group)
}

export function createGroupsRouter() {
  return createRouter({
    getScimV2Groups,
    postScimV2Groups,
    getScimV2GroupsId,
    putScimV2GroupsId,
    patchScimV2GroupsId,
    deleteScimV2GroupsId,
  })
}
