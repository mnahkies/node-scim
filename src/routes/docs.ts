import * as path from "node:path"
import Router from "@koa/router"
import {z} from "zod"
import {StaticFileLoader} from "../utils/static-file-loader"

// TODO: declare in openapi.yaml? Doesn't really fit with scim definitions, maybe
//       supporting multi input file generation would be useful?
export function createDocsRouter() {
  const router = new Router()

  const staticFileLoader = new StaticFileLoader([
    "openapi.yaml",
    "docs/openapi/common.yaml",
    "docs/openapi/groups.yaml",
    "docs/openapi/introspection.yaml",
    "docs/openapi/users.yaml",
  ])

  router.get("/openapi.yaml", async (ctx) => {
    const relativePath = "openapi.yaml"
    ctx.body = await staticFileLoader.readFile(relativePath)
    ctx.res.setHeader("Content-Type", "application/yaml")
    ctx.status = 200
  })

  router.get("/docs", async (ctx) => {
    ctx.body = `
<!DOCTYPE html>
<html>
  <head>
    <title>API Reference - node-scim</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='/openapi.yaml'></redoc>
    <script src="https://cdn.redoc.ly/redoc/v2.1.5/bundles/redoc.standalone.js"
            integrity="sha384-0GrsyTQc9Oqd8h+b2dbc4XdR2T/DYpy0tLNNstyx+LBMUyiBbcWPbEs9aRmUcaxD"
            crossorigin="anonymous"></script>
  </body>
</html>
    `
    ctx.res.setHeader("Content-Type", "text/html")
    ctx.status = 200
  })

  router.get("/docs/openapi/:file", async (ctx) => {
    const {file} = z.object({file: z.string()}).parse(ctx.params)
    const relativePath = path.join("docs", "openapi", file)
    ctx.body = await staticFileLoader.readFile(relativePath)
    ctx.res.setHeader("Content-Type", "application/yaml")
    ctx.status = 200
  })

  return router
}
