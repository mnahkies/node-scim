import {initializeApp} from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import {Config} from "../src/config"
import {listUsers} from "../src/idp-adapters/firebase"

async function main() {
  const config = new Config()
  const app = initializeApp({
    projectId: config.projectId,
  })

  const auth = getAuth(app)

  for await (const user of listUsers(auth, {})) {
    if (!user.email?.endsWith("nahkies.co.nz")) {
      console.info(`deleting ${user.email}`)
      await auth.deleteUser(user.uid)
    }
  }
}

main().catch((err) => {
  console.error(err)
})
