import {config} from "../config"
import {FirebaseAuthService} from "./firebase"

// TODO: don't use global variables.
export const firebase = new FirebaseAuthService({
  projectId: config.projectId,
  providerId: config.providerId,
})
