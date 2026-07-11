import Koa from "koa"
import {beforeEach, describe, expect, it, vi} from "vitest"
import {t_User, t_UsersListing} from "../generated/models"
import {createUsersRouter} from "../generated/routes/users"
import {IdpAdapter} from "../idp-adapters/types"
import {bodyMiddleware} from "../middleware/body.middleware"
import {errorMiddleware} from "../middleware/error.middleware"
import {startTestServer} from "../test-utils"
import {UsersHandlers} from "./users"

describe("UsersHandlers", () => {
  let handlers: UsersHandlers
  let idpAdapter: IdpAdapter
  let baseUrl: string

  beforeEach(async () => {
    idpAdapter = {
      listUsers: vi.fn(),
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    } as unknown as IdpAdapter
    handlers = new UsersHandlers(idpAdapter)

    const app = new Koa()

    app.use(errorMiddleware())
    app.use(bodyMiddleware())

    const router = createUsersRouter(handlers)
    app.use(router.routes())
    app.use(router.allowedMethods())

    const {server, url} = await startTestServer(app)
    baseUrl = url

    return () => server.close()
  })

  it("should get users", async () => {
    const users = [
      {id: "1", userName: "user1", emails: [{value: "user1@example.com"}]},
    ]
    vi.mocked(idpAdapter.listUsers).mockResolvedValue(
      users as unknown as t_User[],
    )

    const response = await fetch(`${baseUrl}/scim/v2/Users`)
    expect(response.status).toBe(200)
    const body = (await response.json()) as t_UsersListing
    expect(body).toMatchObject({
      Resources: users,
      totalResults: 1,
    })
  })

  it("should get user by id", async () => {
    const user = {id: "1", userName: "user1"}
    vi.mocked(idpAdapter.getUser).mockResolvedValue(user as unknown as t_User)

    const response = await fetch(`${baseUrl}/scim/v2/Users/1`)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject(user)
  })

  it("should create user", async () => {
    const createUserBody = {
      userName: "newuser",
      emails: [{value: "newuser@example.com", primary: true}],
      active: true,
    }
    const createdUser = {id: "2", ...createUserBody}
    vi.mocked(idpAdapter.createUser).mockResolvedValue(
      createdUser as unknown as t_User,
    )

    const response = await fetch(`${baseUrl}/scim/v2/Users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(createUserBody),
    })
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject(createdUser)
    expect(idpAdapter.createUser).toHaveBeenCalledWith({
      userName: "newuser",
      email: "newuser@example.com",
      disabled: false,
      displayName: "Unknown",
      externalId: undefined,
    })
  })

  it("should update user", async () => {
    const updateUserBody = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: "updateduser",
      emails: [{value: "updated@example.com"}],
      active: false,
    }
    const updatedUser = {id: "1", ...updateUserBody}
    vi.mocked(idpAdapter.updateUser).mockResolvedValue(
      updatedUser as unknown as t_User,
    )

    const response = await fetch(`${baseUrl}/scim/v2/Users/1`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updateUserBody),
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject(updatedUser)
  })

  it("should delete user", async () => {
    const response = await fetch(`${baseUrl}/scim/v2/Users/1`, {
      method: "DELETE",
    })
    expect(response.status).toBe(204)
    expect(idpAdapter.deleteUser).toHaveBeenCalledWith("1")
  })

  it("should patch user", async () => {
    const user = {
      id: "1",
      userName: "user1",
      emails: [{value: "user1@example.com"}],
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    }
    vi.mocked(idpAdapter.getUser).mockResolvedValue(user as unknown as t_User)
    vi.mocked(idpAdapter.updateUser).mockResolvedValue({
      ...user,
      userName: "patched",
    } as unknown as t_User)

    const patchBody = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: [{op: "replace", path: "userName", value: "patched"}],
    }

    const response = await fetch(`${baseUrl}/scim/v2/Users/1`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(patchBody),
    })
    expect(response.status).toBe(200)
    const body = (await response.json()) as t_User
    expect(body.userName).toBe("patched")
    expect(idpAdapter.updateUser).toHaveBeenCalled()
  })

  it("should filter users", async () => {
    const users = [
      {id: "1", userName: "alice"},
      {id: "2", userName: "bob"},
    ]
    vi.mocked(idpAdapter.listUsers).mockResolvedValue(
      users as unknown as t_User[],
    )

    const response = await fetch(
      `${baseUrl}/scim/v2/Users?filter=userName+eq+%22alice%22`,
    )
    const body = (await response.json()) as t_UsersListing
    expect(body.Resources.length).toBe(1)
    expect(body.Resources[0]?.userName).toBe("alice")
  })

  it("should return 400 for invalid email", async () => {
    const body = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: "test",
      emails: [{value: "invalid-email"}],
    }
    const response = await fetch(`${baseUrl}/scim/v2/Users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    })
    expect(response.status).toBe(400)
  })
})
