import {type App, initializeApp} from "firebase-admin/app"
import {type Auth, type UserRecord, getAuth} from "firebase-admin/auth"
import {groupsRepository} from "../database/repositories"
import type {t_Group, t_User} from "../generated/models"
import type {CreateGroup, CreateUser, IdpAdapter} from "./types"

function mapFirebaseUserToScimUserResource(user: UserRecord): t_User {
  console.info(JSON.stringify(user, undefined, 2))

  return {
    id: user.uid,
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
    const user = await this.auth.getUserByProviderUid(
      this.config.providerId,
      id,
    )
    return mapFirebaseUserToScimUserResource(user)
  }

  async createUser(user: CreateUser): Promise<t_User> {
    if (!user.externalId) {
      console.error(JSON.stringify(user))
      throw new Error("no externalId")
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

  async createGroup(group: CreateGroup): Promise<t_Group> {
    return groupsRepository.create(group)
  }
}
