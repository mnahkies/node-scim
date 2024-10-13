import {Service} from "diod"
import getenv from "getenv"

@Service()
export class Config {
  readonly port = getenv.int("PORT")
  readonly hostname = getenv.string("HOSTNAME")
  readonly secretKey = Buffer.from(getenv("SECRET_KEY"), "utf-8")
  readonly projectId = getenv("PROJECT_ID")
  readonly providerId = getenv("PROVIDER_ID")
}
