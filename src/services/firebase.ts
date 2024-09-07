import {type App, initializeApp} from "firebase-admin/app"
import {type Auth, type UserRecord, getAuth} from "firebase-admin/auth"

export class FirebaseAuthService {
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

  async listUsers(): Promise<UserRecord[]> {
    // TODO: pagination
    const result = await this.auth.listUsers(1000)
    return result.users
  }

  async getUser(id: string): Promise<UserRecord> {
    return this.auth.getUserByProviderUid(this.config.providerId, id)
  }

  async createUser(user: {
    externalId: string | undefined
    email: string
    displayName: string
    disabled: boolean
  }): Promise<UserRecord> {
    return this.auth.createUser({
      email: user.email,
      disabled: user.disabled,
      displayName: user.displayName,
      providerToLink: {
        uid: user.externalId || user.email,
        providerId: this.config.providerId,
      },
    })
  }
}
