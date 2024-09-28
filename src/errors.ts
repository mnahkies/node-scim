import type {t_ScimException} from "./generated/models"

export abstract class DomainError<Type extends string, Meta> extends Error {
  abstract readonly type: Type
  abstract readonly statusCode: number

  readonly metadata: Meta

  constructor(message: string, metadata: Meta, cause?: Error) {
    super(message)
    this.cause = cause
    this.metadata = metadata
  }

  toJSON(): t_ScimException {
    return {
      status: this.statusCode,
      detail: this.message,
    }
  }
}

export class NotFoundError extends DomainError<"not-found", {id: string}> {
  type = "not-found" as const
  statusCode = 404

  constructor(id: string) {
    super(`Resource "${id}" not found`, {id})
  }
}
