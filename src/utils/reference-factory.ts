import {Service} from "diod"
import {Config} from "../config"

@Service()
export class ReferenceFactory {
  constructor(private readonly config: Config) {}

  path(path: string) {
    return `https://${this.config.hostname}:${this.config.port}${path}`
  }

  create$Ref(id: string, type: "User" | "Group") {
    return this.path(`/scim/v2/${type}s/${id}`)
  }
}
