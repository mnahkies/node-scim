import Koa from "koa"
import {beforeEach, describe, expect, it, vi} from "vitest"
import {t_Group, t_GroupsListing} from "../generated/models"
import {createGroupsRouter} from "../generated/routes/groups"
import {IdpAdapter} from "../idp-adapters/types"
import {bodyMiddleware} from "../middleware/body.middleware"
import {errorMiddleware} from "../middleware/error.middleware"
import {startTestServer} from "../test-utils"
import {GroupsHandlers} from "./groups"

describe("GroupsHandlers", () => {
  let handlers: GroupsHandlers
  let idpAdapter: IdpAdapter
  let baseUrl: string

  beforeEach(async () => {
    idpAdapter = {
      listGroups: vi.fn(),
      getGroup: vi.fn(),
      createGroup: vi.fn(),
      replaceGroup: vi.fn(),
      deleteGroup: vi.fn(),
    } as unknown as IdpAdapter
    handlers = new GroupsHandlers(idpAdapter)

    const app = new Koa()

    app.use(errorMiddleware())
    app.use(bodyMiddleware())

    const router = createGroupsRouter(handlers)
    app.use(router.routes())
    app.use(router.allowedMethods())

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should get groups", async () => {
    const groups = [{id: "1", displayName: "Group 1"}]
    vi.mocked(idpAdapter.listGroups).mockResolvedValue(
      groups as unknown as t_Group[],
    )

    const response = await fetch(`${baseUrl}/scim/v2/Groups`)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      Resources: groups,
      totalResults: 1,
    })
  })

  it("should support excludedAttributes when listing", async () => {
    const groups = [{id: "1", displayName: "Group 1", members: [{value: "u1"}]}]
    vi.mocked(idpAdapter.listGroups).mockResolvedValue(
      groups as unknown as t_Group[],
    )

    const response = await fetch(
      `${baseUrl}/scim/v2/Groups?excludedAttributes=members`,
    )
    const body = (await response.json()) as t_GroupsListing
    expect(body.Resources[0]?.members).toBeUndefined()
  })

  it("should get group by id", async () => {
    const group = {id: "1", displayName: "Group 1"}
    vi.mocked(idpAdapter.getGroup).mockResolvedValue(
      group as unknown as t_Group,
    )

    const response = await fetch(`${baseUrl}/scim/v2/Groups/1`)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject(group)
  })

  it("should create group", async () => {
    const body = {
      displayName: "New Group",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    }
    const created = {id: "2", ...body}
    vi.mocked(idpAdapter.createGroup).mockResolvedValue(
      created as unknown as t_Group,
    )

    const response = await fetch(`${baseUrl}/scim/v2/Groups`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    })
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject(created)
  })

  it("should replace group", async () => {
    const group = {
      id: "1",
      displayName: "Old",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    }
    const body = {
      displayName: "New",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    }
    vi.mocked(idpAdapter.getGroup).mockResolvedValue(
      group as unknown as t_Group,
    )
    vi.mocked(idpAdapter.replaceGroup).mockResolvedValue({
      ...group,
      ...body,
    } as unknown as t_Group)

    const response = await fetch(`${baseUrl}/scim/v2/Groups/1`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    })
    expect(response.status).toBe(200)
    const responseBody = (await response.json()) as t_Group
    expect(responseBody.displayName).toBe("New")
  })

  it("should delete group", async () => {
    const response = await fetch(`${baseUrl}/scim/v2/Groups/1`, {
      method: "DELETE",
    })
    expect(response.status).toBe(204)
    expect(idpAdapter.deleteGroup).toHaveBeenCalledWith("1")
  })

  it("should patch group", async () => {
    const group = {
      id: "1",
      displayName: "Old",
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    }
    vi.mocked(idpAdapter.getGroup).mockResolvedValue(
      group as unknown as t_Group,
    )
    vi.mocked(idpAdapter.replaceGroup).mockImplementation(
      async (_id, g) => g as unknown as t_Group,
    )

    const patchBody = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: [{op: "replace", path: "displayName", value: "Patched"}],
    }

    const response = await fetch(`${baseUrl}/scim/v2/Groups/1`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(patchBody),
    })
    expect(response.status).toBe(200)
    const responseBody = (await response.json()) as t_Group
    expect(responseBody.displayName).toBe("Patched")
  })

  it("should filter groups", async () => {
    const groups = [
      {id: "1", displayName: "G1"},
      {id: "2", displayName: "G2"},
    ]
    vi.mocked(idpAdapter.listGroups).mockResolvedValue(
      groups as unknown as t_Group[],
    )

    const response = await fetch(
      `${baseUrl}/scim/v2/Groups?filter=displayName+eq+%22G1%22`,
    )
    const body = (await response.json()) as t_GroupsListing
    expect(body.Resources.length).toBe(1)
    expect(body.Resources[0]?.displayName).toBe("G1")
  })

  it("should support excludedAttributes when getting by id", async () => {
    const group = {id: "1", displayName: "G1", members: [{value: "u1"}]}
    vi.mocked(idpAdapter.getGroup).mockResolvedValue(
      group as unknown as t_Group,
    )

    const response = await fetch(
      `${baseUrl}/scim/v2/Groups/1?excludedAttributes=members`,
    )
    const body = (await response.json()) as t_Group
    expect(body.members).toBeUndefined()
  })
})
