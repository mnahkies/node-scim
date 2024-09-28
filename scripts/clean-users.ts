import {initializeApp} from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import type {Auth, UserRecord} from "firebase-admin/auth"
import {config} from "../src/config"

async function* listUsers(auth: Auth): AsyncGenerator<UserRecord> {
  let nextPageToken: string | undefined = undefined

  do {
    const result = await auth.listUsers(1000, nextPageToken)

    for (const user of result.users) {
      yield user
    }

    nextPageToken = result.pageToken
  } while (nextPageToken)
}

async function main() {
  const app = initializeApp({
    projectId: config.projectId,
  })

  const auth = getAuth(app)

  for await (const user of listUsers(auth)) {
    if (!user.email?.endsWith("nahkies.co.nz")) {
      console.info(`deleting ${user.email}`)
      await auth.deleteUser(user.uid)
    }
  }
}

main().catch((err) => {
  console.error(err)
})
