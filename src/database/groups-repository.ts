import crypto from "node:crypto"
import {ConflictError, NotFoundError} from "../errors"
import type {t_Group} from "../generated/models"
import type {CreateGroup} from "../idp-adapters/types"

export class GroupsRepository {
  private readonly data = new Map<string, t_Group>()

  async create(it: CreateGroup): Promise<t_Group> {
    if (
      Array.from(this.data.values()).find(
        (e) => e.displayName === it.displayName,
      )
    ) {
      throw new ConflictError(it.displayName)
    }

    const id = crypto.randomUUID()

    const group = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group" as const],
      id,
      externalId: it.externalId,
      displayName: it.displayName,
      members: [],
      meta: {},
    }

    this.data.set(id, group)

    return group
  }

  async replace(id: string, it: CreateGroup): Promise<t_Group> {
    if (!this.data.has(id)) {
      throw new NotFoundError(id)
    }

    const group = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group" as const],
      id: crypto.randomUUID(),
      externalId: it.externalId,
      displayName: it.displayName,
      members: [],
      meta: {},
    }

    this.data.set(id, group)

    return group
  }

  async delete(id: string): Promise<void> {
    if (!this.data.has(id)) {
      throw new NotFoundError(id)
    }

    this.data.delete(id)
  }

  async getById(id: string): Promise<t_Group> {
    const result = this.data.get(id)

    if (!result) {
      throw new NotFoundError(id)
    }

    return result
  }

  async listGroups() {
    return Array.from(this.data.values())
  }
}
