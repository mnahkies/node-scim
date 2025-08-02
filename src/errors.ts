import {ZodError} from "zod"
import type {t_ScimException, t_ScimExceptionType} from "./generated/models"
import {s_ScimException} from "./generated/schemas"

export abstract class DomainError<Type extends string, Meta> extends Error {
  abstract readonly type: Type
  abstract readonly statusCode: number
  readonly scimType: t_ScimExceptionType | undefined
  readonly metadata: Meta | undefined

  constructor({
    message,
    scimType,
    metadata,
    cause,
  }: {
    message: string
    scimType?: t_ScimExceptionType
    metadata?: Meta
    cause?: Error
  }) {
    super(message)
    this.cause = cause
    this.scimType = scimType
    this.metadata = metadata
  }

  toJSON(): t_ScimException {
    return s_ScimException.passthrough().parse({
      status: this.statusCode,
      scimType: this.scimType,
      detail: this.message,
      metadata: this.metadata,
    })
  }
}

export class NotFoundError extends DomainError<"not-found", {id: string}> {
  type = "not-found" as const
  statusCode = 404

  constructor(id: string) {
    super({message: `Resource "${id}" not found`, metadata: {id}})
  }
}

export class ConflictError extends DomainError<"conflict", unknown> {
  type = "conflict" as const
  statusCode = 409

  constructor(value: string) {
    super({
      message: `Conflicts with existing resource for unique field with value '${value}'`,
      scimType: "uniqueness",
      metadata: {value},
    })
  }
}

export class PatchError extends DomainError<"patch", unknown> {
  type = "patch" as const
  statusCode = 400

  constructor(message: string, scimType: t_ScimExceptionType) {
    super({
      message,
      scimType,
    })
  }
}

export class InvalidSyntaxError extends DomainError<"invalidSyntax", unknown> {
  type = "invalidSyntax" as const
  statusCode = 400

  constructor(err: Error) {
    super({
      message: "Validation failed",
      scimType: "invalidSyntax",
      metadata:
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
      cause: err,
    })
  }
}

export class ValidationError extends DomainError<"validation", unknown> {
  type = "validation" as const
  statusCode = 400

  constructor(err: Error) {
    super({
      message: "Validation failed",
      scimType: "invalidValue",
      metadata:
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
      cause: err,
    })
  }
}

export class ForbiddenError extends DomainError<"forbidden", unknown> {
  type = "forbidden" as const
  statusCode = 403

  constructor() {
    super({message: "Forbidden"})
  }
}

export class InternalServerError extends DomainError<
  "internal-server-error",
  unknown
> {
  type = "internal-server-error" as const
  statusCode = 500

  constructor(err: Error) {
    super({
      message: "Internal server error",
      metadata: {
        message: err.message,
        stack: err.stack,
        cause: err.cause &&
          err.cause instanceof Error && {
            message: err.cause.message,
            stack: err.cause.stack,
          },
      },
      cause: err,
    })
  }
}
