import {Service} from "diod"
import type {
  DeleteScimV2GroupsId,
  GetScimV2Groups,
  GetScimV2GroupsId,
  Implementation,
  PatchScimV2GroupsId,
  PostScimV2Groups,
  PutScimV2GroupsId,
} from "../generated/routes/groups"
// biome-ignore lint/style/useImportType: needed for DI
import {IdpAdapter} from "../idp-adapters/types"
import {parseFilter, performPatchOperation} from "../utils"

@Service()
export class GroupsHandlers implements Implementation {
  constructor(private readonly firebase: IdpAdapter) {}

  postScimV2Groups: PostScimV2Groups = async ({body}, respond) => {
    const group = await this.firebase.createGroup(body)
    return respond.with201().body(group)
  }

  putScimV2GroupsId: PutScimV2GroupsId = async ({params, body}, respond) => {
    const group = await this.firebase.getGroup(params.id)
    // TODO: deep merge, check if RFC actually specifies this as a merge
    const updated = await this.firebase.replaceGroup(params.id, {
      ...group,
      ...body,
    })
    return respond.with200().body(updated)
  }

  deleteScimV2GroupsId: DeleteScimV2GroupsId = async ({params}, respond) => {
    await this.firebase.deleteGroup(params.id)
    return respond.with204().body()
  }

  patchScimV2GroupsId: PatchScimV2GroupsId = async (
    {params, body},
    respond,
  ) => {
    const group = await this.firebase.getGroup(params.id)
    const operations = body.Operations ?? []

    let updated = {...group}
    for (const operation of operations) {
      updated = performPatchOperation(updated, operation)
    }

    await this.firebase.replaceGroup(group.id, updated)

    return respond.with200().body(updated)
  }

  getScimV2Groups: GetScimV2Groups = async ({query}, respond) => {
    const take = query.count
    const skip =
      query.startIndex !== undefined && query.count !== undefined
        ? (query.startIndex - 1) * query.count
        : 0

    let groups = await this.firebase.listGroups({
      take,
      skip,
    })

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

  getScimV2GroupsId: GetScimV2GroupsId = async ({params, query}, respond) => {
    const group = await this.firebase.getGroup(params.id)

    if (query.excludedAttributes) {
      const excludedAttributes = query.excludedAttributes.split(",")
      for (const excludedAttribute of excludedAttributes) {
        // @ts-ignore
        group[excludedAttribute] = undefined
      }
    }

    return respond.with200().body(group)
  }
}
