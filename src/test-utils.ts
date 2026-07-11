import type {Server} from "node:http"
import type {AddressInfo} from "node:net"
import Koa from "koa"

export async function startTestServer(app: Koa) {
  return new Promise<{server: Server; url: string}>((resolve, reject) => {
    try {
      const server = app.listen(0, "127.0.0.1", () => {
        const address = server.address() as AddressInfo
        resolve({server, url: `http://127.0.0.1:${address.port}`})
      })
      server.on("error", reject)
    } catch (err) {
      reject(err)
    }
  })
}
