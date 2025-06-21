import fs from "node:fs/promises"
import path from "node:path"
import {ForbiddenError, NotFoundError} from "../errors"

export class StaticFileLoader {
  private readonly absolutePathAllowList: Set<string>
  private readonly cache = new Map<string, string>()

  constructor(
    relativePathAllowList: string[],
    private readonly baseDir = process.cwd(),
  ) {
    this.absolutePathAllowList = new Set(
      relativePathAllowList.map((it) => path.join(this.baseDir, it)),
    )
  }

  async readFile(relativePath: string): Promise<string> {
    const absolutePath = path.join(this.baseDir, relativePath)

    if (!this.absolutePathAllowList.has(absolutePath)) {
      throw new ForbiddenError()
    }

    if (!this.cache.has(absolutePath)) {
      if (!(await fs.stat(absolutePath)).isFile()) {
        throw new NotFoundError(relativePath)
      }

      const content = await fs.readFile(absolutePath, "utf-8")
      this.cache.set(absolutePath, content)
    }

    // biome-ignore lint/style/noNonNullAssertion: we know its defined
    return this.cache.get(absolutePath)!
  }
}
