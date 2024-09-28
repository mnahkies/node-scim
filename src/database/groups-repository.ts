import crypto from "node:crypto"
import {ConflictError, NotFoundError} from "../errors"
import type {t_Group} from "../generated/models"
import type {CreateGroup} from "../idp-adapters/types"

export class GroupsRepository {
  private readonly data: Record<string, t_Group> = {}

  async create(it: CreateGroup): Promise<t_Group> {
    if (
      Object.values(this.data).find((e) => e.displayName === it.displayName)
    ) {
      throw new ConflictError(it.displayName)
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

  async getById(id: string): Promise<t_Group> {
    const result = this.data[id]

    if (!result) {
      throw new NotFoundError(id)
    }

    return result
  }

  async listGroups() {
    return Object.values(this.data)
  }
}
