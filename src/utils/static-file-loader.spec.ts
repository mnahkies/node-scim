import {Stats} from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"
import {beforeEach, describe, expect, it, vi} from "vitest"
import {ForbiddenError, NotFoundError} from "../errors"
import {StaticFileLoader} from "./static-file-loader"

vi.mock("node:fs/promises")

describe("StaticFileLoader", () => {
  const baseDir = "/test/base"
  const allowList = ["allowed.txt", "docs/info.md"]
  let loader: StaticFileLoader

  beforeEach(() => {
    vi.resetAllMocks()
    loader = new StaticFileLoader(allowList, baseDir)
  })

  it("should read an allowed file and cache its content", async () => {
    const relativePath = "allowed.txt"
    const absolutePath = path.join(baseDir, relativePath)
    const content = "hello world"

    vi.mocked(fs.stat).mockResolvedValue({isFile: () => true} as Stats)
    vi.mocked(fs.readFile).mockResolvedValue(content)

    const result = await loader.readFile(relativePath)
    expect(result).toBe(content)
    expect(fs.readFile).toHaveBeenCalledWith(absolutePath, "utf-8")

    // Second call should use cache
    const cachedResult = await loader.readFile(relativePath)
    expect(cachedResult).toBe(content)
    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })

  it("should throw ForbiddenError if file is not in allowList", async () => {
    const relativePath = "forbidden.txt"
    await expect(loader.readFile(relativePath)).rejects.toThrow(ForbiddenError)
  })

  it("should throw NotFoundError if file does not exist or is not a file", async () => {
    const relativePath = "allowed.txt"
    vi.mocked(fs.stat).mockResolvedValue({isFile: () => false} as Stats)

    await expect(loader.readFile(relativePath)).rejects.toThrow(NotFoundError)
  })

  it("should throw error if fs.stat fails", async () => {
    const relativePath = "allowed.txt"
    vi.mocked(fs.stat).mockRejectedValue(new Error("Disk error"))

    await expect(loader.readFile(relativePath)).rejects.toThrow("Disk error")
  })
})
