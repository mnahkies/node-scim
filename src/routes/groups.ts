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
import {IdpAdapter} from "../idp-adapters/types"
import {ScimSchemaCoreGroup} from "../scim-schemas"
import {evaluateFilter, parseFilter, performPatchOperation} from "../utils"

@Service()
export class GroupsHandlers implements Implementation {
  constructor(private readonly idpAdapter: IdpAdapter) {}

  postScimV2Groups: PostScimV2Groups = async ({body}, respond) => {
    const group = await this.idpAdapter.createGroup(body)
    return respond.with201().body(group)
  }

  putScimV2GroupsId: PutScimV2GroupsId = async ({params, body}, respond) => {
    const group = await this.idpAdapter.getGroup(params.id)
    // TODO: deep merge, check if RFC actually specifies this as a merge
    const updated = await this.idpAdapter.replaceGroup(params.id, {
      ...group,
      ...body,
    })
    return respond.with200().body(updated)
  }

  deleteScimV2GroupsId: DeleteScimV2GroupsId = async ({params}, respond) => {
    await this.idpAdapter.deleteGroup(params.id)
    return respond.with204().body()
  }

  patchScimV2GroupsId: PatchScimV2GroupsId = async (
    {params, body},
    respond,
  ) => {
    const group = await this.idpAdapter.getGroup(params.id)
    const operations = body.Operations ?? []

    let updated = {...group}
    for (const operation of operations) {
      updated = performPatchOperation(updated, operation, ScimSchemaCoreGroup)
    }

    await this.idpAdapter.replaceGroup(group.id, updated)

    return respond.with200().body(updated)
  }

  getScimV2Groups: GetScimV2Groups = async ({query}, respond) => {
    const take = query.count
    const skip =
      query.startIndex !== undefined && query.count !== undefined
        ? (query.startIndex - 1) * query.count
        : 0

    let groups = await this.idpAdapter.listGroups({
      take,
      skip,
    })

    if (query.filter) {
      const filter = parseFilter(query.filter)
      groups = groups.filter((it) =>
        evaluateFilter(filter, it, ScimSchemaCoreGroup),
      )
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
    const group = await this.idpAdapter.getGroup(params.id)

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
