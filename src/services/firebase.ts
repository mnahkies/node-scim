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

    return updatedFirebaseUser
  }
}
