import {beforeEach, describe, expect, it} from "vitest"
import {Config} from "../config"
import {ConflictError, NotFoundError} from "../errors"
import {t_CreateGroup, t_Group} from "../generated/models"
import {ReferenceFactory} from "../utils/reference-factory"
import {GroupsRepository} from "./groups-repository"

describe("GroupsRepository", () => {
  let repository: GroupsRepository

  beforeEach(() => {
    repository = new GroupsRepository(
      new ReferenceFactory({hostname: "localhost", port: 3000} as Config),
    )
  })

  it("should create and retrieve a group", async () => {
    const createData: t_CreateGroup = {
      displayName: "Admins",
      externalId: "ext-1",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    }
    const created = await repository.create(createData)
    expect(created.displayName).toBe("Admins")
    expect(created.id).toBeDefined()

    const retrieved = await repository.getById(created.id)
    expect(retrieved).toEqual(created)
  })

  it("should throw ConflictError if group with same displayName exists", async () => {
    await repository.create({
      displayName: "Admins",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    await expect(
      repository.create({
        displayName: "Admins",
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
      }),
    ).rejects.toThrow(ConflictError)
  })

  it("should throw NotFoundError if group does not exist", async () => {
    await expect(repository.getById("non-existent")).rejects.toThrow(
      NotFoundError,
    )
  })

  it("should check if group exists", async () => {
    const created = await repository.create({
      displayName: "Admins",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    expect(await repository.groupExists(created.id)).toBe(true)
    expect(await repository.groupExists("non-existent")).toBe(false)
  })

  it("should replace a group", async () => {
    const created = await repository.create({
      displayName: "Admins",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    const replaceData: t_Group = {
      ...created,
      displayName: "New Admins",
      members: [{value: "user-1"}],
    }
    const replaced = await repository.replace(created.id, replaceData)
    expect(replaced.displayName).toBe("New Admins")
    expect(replaced.members).toEqual([{value: "user-1"}])
  })

  it("should delete a group", async () => {
    const created = await repository.create({
      displayName: "Admins",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    await repository.delete(created.id)
    expect(await repository.groupExists(created.id)).toBe(false)
  })

  it("should list groups with pagination", async () => {
    await repository.create({
      displayName: "Group 1",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    await repository.create({
      displayName: "Group 2",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    await repository.create({
      displayName: "Group 3",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })

    const list1 = await repository.listGroups({take: 2, skip: 0})
    expect(list1.length).toBe(2)

    const list2 = await repository.listGroups({take: 2, skip: 2})
    expect(list2.length).toBe(1)
  })

  it("should find groups for a user", async () => {
    const g1 = await repository.create({
      displayName: "G1",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    await repository.replace(g1.id, {...g1, members: [{value: "u1"}]})

    await repository.create({
      displayName: "G2",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    })
    // u1 not in G2

    const groups = await repository.userGroups("u1")
    expect(groups.length).toBe(1)
    expect(groups[0]?.display).toBe("G1")
  })
})
