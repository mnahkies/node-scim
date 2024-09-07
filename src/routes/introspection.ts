import {createRouter} from "../generated/routes/introspection"
import {notImplemented} from "../utils"

export function createIntrospectionRouter() {
  return createRouter({
    getScimV2ServiceProviderConfig: notImplemented,
    getScimV2ResourceTypes: notImplemented,
    getScimV2Schemas: notImplemented,
  })
}
