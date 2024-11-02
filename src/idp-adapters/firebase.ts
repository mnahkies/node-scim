import {Service} from "diod"
import {type App, initializeApp} from "firebase-admin/app"
import {
  type Auth,
  FirebaseAuthError,
  type UserRecord,
  getAuth,
} from "firebase-admin/auth"
import {Config} from "../config"
import {GroupsRepository} from "../database/groups-repository"
import {ConflictError, NotFoundError} from "../errors"
import type {
  t_CreateGroup,
  t_Group,
  t_ResourceType,
  t_Schema,
  t_User,
} from "../generated/models"
import {ScimSchemaCoreGroup, ScimSchemaCoreUser} from "../scim-schemas"
import {ReferenceFactory} from "../utils/reference-factory"
import type {
  CreateUser,
  IdpAdapter,
  PaginationParams,
  ServiceProviderConfigCapabilities,
} from "./types"

export async function* listUsers(
  auth: Auth,
  {
    skip = 0,
    take = Number.POSITIVE_INFINITY,
  }: {skip?: number | undefined; take?: number | undefined},
): AsyncGenerator<UserRecord> {
  let nextPageToken: string | undefined = undefined
  let i = 0
  do {
    const result = await auth.listUsers(1000, nextPageToken)

    for (const user of result.users) {
      if (skip > 0) {
        skip--
        continue
      }

      yield user
      i++

      if (i === take) {
        return
      }
    }

    nextPageToken = result.pageToken
  } while (nextPageToken)
}

@Service()
export class FirebaseAuthIdpAdapter implements IdpAdapter {
  private readonly app: App
  private readonly auth: Auth

  constructor(
    private readonly config: Config,
    private readonly groupsRepository: GroupsRepository,
    private readonly referenceManager: ReferenceFactory,
  ) {
    this.app = initializeApp({
      projectId: config.projectId,
    })

    this.auth = getAuth(this.app)
  }

  async checkAuth() {
    await this.auth.getProviderConfig(this.config.providerId)
  }

  //region Introspection
  async capabilities(): Promise<ServiceProviderConfigCapabilities> {
    return {
      patch: {supported: true},
      bulk: {
        supported: false,
      },
      filter: {
        supported: true,
        maxResults: 100,
      },
      changePassword: {
        supported: false,
      },
      sort: {
        supported: false,
      },
      pagination: {
        cursor: false,
        index: true,
        defaultPaginationMethod: "index",
        defaultPageSize: 10,
        maxPageSize: 100,
        cursorTimeout: 3600,
      },
    }
  }

  async resourceTypes(): Promise<t_ResourceType[]> {
    return [
      {
        id: "User",
        name: "Users",
        description: "User Account",
        schema: "urn:ietf:params:scim:schemas:core:2.0:User",
        schemaExtensions: [
          // "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
        ],
      },
      {
        id: "Group",
        name: "Groups",
        description: "Group",
        schema: "urn:ietf:params:scim:schemas:core:2.0:Group",
        schemaExtensions: [],
      },
    ]
  }

  async resourceSchemas(): Promise<t_Schema[]> {
    return [ScimSchemaCoreUser, ScimSchemaCoreGroup]
  }

  //endregion

  //region Users
  async listUsers({take, skip}: PaginationParams): Promise<t_User[]> {
    const result: t_User[] = []

    for await (const firebaseUser of listUsers(this.auth, {take, skip})) {
      result.push(await this.mapFirebaseUserToScimUserResource(firebaseUser))
    }

    return result
  }

  async getUser(id: string): Promise<t_User> {
    try {
      const user = await this.auth.getUser(id)
      // const user = await this.auth.getUserByProviderUid(
      //   this.config.providerId,
      //   id,
      // )
      return this.mapFirebaseUserToScimUserResource(user)
    } catch (err: unknown) {
      this.mapNotFoundError(err, id)
      throw err
    }
  }

  private async userExists(id: string): Promise<boolean> {
    try {
      await this.auth.getUser(id)
      return true
    } catch (err: unknown) {
      if (
        err instanceof FirebaseAuthError &&
        err.code === "auth/user-not-found"
      ) {
        return false
      }
      throw err
    }
  }

  async createUser(user: CreateUser): Promise<t_User> {
    if (!user.externalId) {
      console.error(JSON.stringify(user))
      throw new Error("no externalId")
    }

    const existing = await this.auth.getUserByEmail(user.email).catch((err) => {
      // todo; handle other error codes
      if (
        err instanceof FirebaseAuthError &&
        err.code === "auth/user-not-found"
      ) {
        return undefined
      }
      throw err
    })

    if (existing) {
      throw new ConflictError(user.email)
    }

    const firebaseUser = await this.auth.createUser({
      email: user.email,
      disabled: user.disabled,
      displayName: user.displayName,
    })

    const updatedFirebaseUser = await this.auth.updateUser(firebaseUser.uid, {
      email: user.email,
      disabled: user.disabled,
      displayName: user.displayName,
      providerToLink: {
        providerId: this.config.providerId,
        displayName: user.displayName,
        email: user.email,
        uid: user.externalId,
      },
    })

    return this.mapFirebaseUserToScimUserResource(updatedFirebaseUser)
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.auth.deleteUser(id)
    } catch (err) {
      this.mapNotFoundError(err, id)
      throw err
    }
  }

  async updateUser(id: string, user: CreateUser): Promise<t_User> {
    try {
      if (!user.externalId) {
        console.error(JSON.stringify(user))
        throw new Error("no externalId")
      }

      await this.auth.updateUser(id, {
        providersToUnlink: [this.config.providerId],
      })

      const updatedFirebaseUser = await this.auth.updateUser(id, {
        email: user.email,
        disabled: user.disabled,
        displayName: user.displayName,
        providerToLink: {
          providerId: this.config.providerId,
          displayName: user.displayName,
          email: user.email,
          uid: user.externalId,
        },
      })

      return this.mapFirebaseUserToScimUserResource(updatedFirebaseUser)
    } catch (err) {
      this.mapNotFoundError(err, id)
      throw err
    }
  }
  //endregion

  //region Groups
  async listGroups({take, skip}: PaginationParams) {
    return this.groupsRepository.listGroups({take, skip})
  }

  async createGroup(group: t_CreateGroup): Promise<t_Group> {
    return this.groupsRepository.create(group)
  }

  async replaceGroup(id: string, group: t_Group): Promise<t_Group> {
    const members = await Promise.all(
      (group.members ?? []).map(async (member) => {
        if (await this.userExists(member.value)) {
          return {
            value: member.value,
            type: "User" as const,
            $ref: this.referenceManager.create$Ref(member.value, "User"),
          }
        }
        if (await this.groupsRepository.groupExists(member.value)) {
          return {
            value: member.value,
            type: "Group" as const,
            $ref: this.referenceManager.create$Ref(member.value, "Group"),
          }
        }
        throw new NotFoundError(member.value)
      }),
    )

    return this.groupsRepository.replace(id, {...group, members})
  }

  async deleteGroup(id: string): Promise<void> {
    return this.groupsRepository.delete(id)
  }

  async getGroup(id: string): Promise<t_Group> {
    return this.groupsRepository.getById(id)
  }
  //endregion

  private mapNotFoundError(err: unknown, id: string) {
    if (
      err instanceof FirebaseAuthError &&
      err.code === "auth/user-not-found"
    ) {
      throw new NotFoundError(id)
    }
  }

  private async mapFirebaseUserToScimUserResource(
    user: UserRecord,
  ): Promise<t_User> {
    console.info(JSON.stringify(user, undefined, 2))

    return {
      id: user.uid,
      displayName: user.displayName,
      active: !user.disabled,
      emails: user.email
        ? [
            {
              primary: true,
              value: user.email,
            },
          ]
        : [],
      groups: await this.groupsRepository.userGroups(user.uid),
      meta: {
        resourceType: "User",
      },
      name: {
        familyName: undefined,
        formatted: user.displayName,
        givenName: undefined,
        honorificPrefix: undefined,
        honorificSuffix: undefined,
        middleName: undefined,
      },
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: user.email ?? "",
    }
  }
}
