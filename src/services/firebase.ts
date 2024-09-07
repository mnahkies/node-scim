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
}
