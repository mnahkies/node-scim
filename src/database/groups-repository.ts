import crypto from "node:crypto"
import {ConflictError, NotFoundError} from "../errors"
import type {t_CreateGroup, t_Group, t_UserGroup} from "../generated/models"
import type {PaginationParams} from "../idp-adapters/types"
import {create$Ref} from "../utils"

export class GroupsRepository {
  private readonly data = new Map<string, t_Group>()

  async userGroups(userId: string): Promise<t_UserGroup[]> {
    const result: t_UserGroup[] = []

    for (const group of this.data.values()) {
      if (group.members?.find((it) => it.value === userId)) {
        result.push({
          value: group.id,
          display: group.displayName,
          $ref: create$Ref(group.id, "Group"),
          // TODO: support retrieving indirect membership
          type: "direct",
        })
      }
    }

    return result
  }

  async groupExists(id: string): Promise<boolean> {
    return this.data.has(id)
  }

  async create(it: t_CreateGroup): Promise<t_Group> {
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
      // TODO: is it possible to provide members at time of group creation?
      members: [],
      // TODO: metadata
      meta: {},
    }

    this.data.set(id, group)

    return group
  }

  async replace(id: string, it: t_Group): Promise<t_Group> {
    if (!this.data.has(id)) {
      throw new NotFoundError(id)
    }

    const group = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group" as const],
      id,
      externalId: it.externalId,
      displayName: it.displayName,
      members: it.members ?? [],
      // TODO: metadata
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

  async listGroups({
    take = Number.POSITIVE_INFINITY,
    skip = 0,
  }: PaginationParams) {
    const result: t_Group[] = []

    for (const group of this.data.values()) {
      if (skip > 0) {
        skip--
        continue
      }
      result.push(group)

      if (result.length >= take) {
        break
      }
    }

    return result
  }
}
