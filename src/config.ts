import getenv from "getenv"

export const config = {
  port: getenv.int("PORT"),
  secretKey: Buffer.from(getenv("SECRET_KEY"), "utf-8"),
}
