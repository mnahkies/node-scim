import crypto from "node:crypto"
import type {t_Group} from "../generated/models"
import type {CreateGroup} from "../idp-adapters/types"

export class GroupsRepository {
  private readonly data: Record<string, t_Group> = {}

  async create(it: CreateGroup): Promise<t_Group> {
    if (!it.externalId) {
      throw new Error("no externalId")
    }

    const id = crypto.randomUUID()

    const group = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group" as const],
      id: crypto.randomUUID(),
      externalId: it.externalId,
      displayName: it.displayName,
      members: [],
      meta: {},
    }

    this.data[id] = group

    return group
  }
}
