import {type App, initializeApp} from "firebase-admin/app"
import {
  type Auth,
  FirebaseAuthError,
  type UserRecord,
  getAuth,
} from "firebase-admin/auth"
import {groupsRepository} from "../database/repositories"
import {ConflictError, NotFoundError, ValidationError} from "../errors"
import type {t_Group, t_User} from "../generated/models"
import type {CreateGroup, CreateUser, IdpAdapter} from "./types"

function mapFirebaseUserToScimUserResource(user: UserRecord): t_User {
  console.info(JSON.stringify(user, undefined, 2))

  return {
    id: user.uid,
    displayName: user.displayName,
    active: !user.disabled,
    emails: [],
    groups: [],
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

export class FirebaseAuthService implements IdpAdapter {
  private readonly app: App
  private readonly auth: Auth

  constructor(
    private readonly config: {projectId: string; providerId: string},
  ) {
    this.app = initializeApp({
      projectId: config.projectId,
    })

    this.auth = getAuth(this.app)
  }

  async listUsers(): Promise<t_User[]> {
    // TODO: pagination
    const result = await this.auth.listUsers(1000)
    return result.users.map(mapFirebaseUserToScimUserResource)
  }

  async getUser(id: string): Promise<t_User> {
    try {
      const user = await this.auth.getUser(id)
      // const user = await this.auth.getUserByProviderUid(
      //   this.config.providerId,
      //   id,
      // )
      return mapFirebaseUserToScimUserResource(user)
    } catch (err: unknown) {
      this.mapNotFoundError(err, id)
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

    return mapFirebaseUserToScimUserResource(updatedFirebaseUser)
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

      return mapFirebaseUserToScimUserResource(updatedFirebaseUser)
    } catch (err) {
      this.mapNotFoundError(err, id)
      throw err
    }
  }

  async listGroups() {
    return groupsRepository.listGroups()
  }

  async createGroup(group: CreateGroup): Promise<t_Group> {
    return groupsRepository.create(group)
  }

  async replaceGroup(id: string, group: CreateGroup): Promise<t_Group> {
    return groupsRepository.replace(id, group)
  }

  async deleteGroup(id: string): Promise<void> {
    return groupsRepository.delete(id)
  }

  async getGroup(id: string): Promise<t_Group> {
    return groupsRepository.getById(id)
  }

  private mapNotFoundError(err: unknown, id: string) {
    if (
      err instanceof FirebaseAuthError &&
      err.code === "auth/user-not-found"
    ) {
      throw new NotFoundError(id)
    }
  }
}
