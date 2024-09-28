import {ZodError} from "zod"
import type {t_ScimException} from "./generated/models"
import {s_ScimException} from "./generated/schemas"

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
    return s_ScimException.passthrough().parse({
      status: this.statusCode,
      detail: this.message,
      metadata: this.metadata,
    })
  }
}

export class NotFoundError extends DomainError<"not-found", {id: string}> {
  type = "not-found" as const
  statusCode = 404

  constructor(id: string) {
    super(`Resource "${id}" not found`, {id})
  }
}

export class ConflictError extends DomainError<"conflict", unknown> {
  type = "conflict" as const
  statusCode = 409

  constructor(value: string) {
    super(
      `Conflicts with existing resource for unique field with value '${value}'`,
      {value},
    )
  }
}

export class ValidationError extends DomainError<"validation", unknown> {
  type = "validation" as const
  statusCode = 400

  constructor(err: Error) {
    super(
      "Validation failed",
      err instanceof ZodError
        ? err.errors
        : // TODO: don't return internal error details to clients
          {
            message: err.message,
            stack: err.stack,
            cause: err.cause &&
              err.cause instanceof Error && {
                message: err.cause.message,
                stack: err.cause.stack,
              },
          },
      err,
    )
  }
}

export class InternalServerError extends DomainError<
  "internal-server-error",
  unknown
> {
  type = "internal-server-error" as const
  statusCode = 500

  constructor(err: Error) {
    super(
      "Internal server error",
      // TODO: don't return internal error details to clients
      {
        message: err.message,
        stack: err.stack,
        cause: err.cause &&
          err.cause instanceof Error && {
            message: err.cause.message,
            stack: err.cause.stack,
          },
      },
      err,
    )
  }
}
