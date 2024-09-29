/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import KoaRouter, {RouterContext} from "@koa/router"
import {
  KoaRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-koa-runtime/errors"
import {
  KoaRuntimeResponder,
  KoaRuntimeResponse,
  Response,
  StatusCode,
} from "@nahkies/typescript-koa-runtime/server"
import {
  Params,
  parseRequestInput,
  responseValidationFactory,
} from "@nahkies/typescript-koa-runtime/zod"
import {z} from "zod"
import {
  t_DeleteScimV2GroupsIdParamSchema,
  t_DeleteScimV2GroupsIdQuerySchema,
  t_GetScimV2GroupsIdParamSchema,
  t_GetScimV2GroupsIdQuerySchema,
  t_GetScimV2GroupsQuerySchema,
  t_Group,
  t_GroupsListing,
  t_PatchScimV2GroupsIdBodySchema,
  t_PatchScimV2GroupsIdParamSchema,
  t_PatchScimV2GroupsIdQuerySchema,
  t_PostScimV2GroupsBodySchema,
  t_PutScimV2GroupsIdBodySchema,
  t_PutScimV2GroupsIdParamSchema,
  t_PutScimV2GroupsIdQuerySchema,
  t_ScimException,
} from "../models"
import {
  s_CreateGroup,
  s_Group,
  s_GroupsListing,
  s_Patch,
  s_ScimException,
} from "../schemas"

export type GetScimV2GroupsResponder = {
  with200(): KoaRuntimeResponse<t_GroupsListing>
} & KoaRuntimeResponder

export type GetScimV2Groups = (
  params: Params<void, t_GetScimV2GroupsQuerySchema, void, void>,
  respond: GetScimV2GroupsResponder,
  ctx: RouterContext,
) => Promise<KoaRuntimeResponse<unknown> | Response<200, t_GroupsListing>>

export type PostScimV2GroupsResponder = {
  with201(): KoaRuntimeResponse<t_Group>
} & KoaRuntimeResponder

export type PostScimV2Groups = (
  params: Params<void, void, t_PostScimV2GroupsBodySchema, void>,
  respond: PostScimV2GroupsResponder,
  ctx: RouterContext,
) => Promise<KoaRuntimeResponse<unknown> | Response<201, t_Group>>

export type GetScimV2GroupsIdResponder = {
  with200(): KoaRuntimeResponse<t_Group>
  with404(): KoaRuntimeResponse<t_ScimException>
} & KoaRuntimeResponder

export type GetScimV2GroupsId = (
  params: Params<
    t_GetScimV2GroupsIdParamSchema,
    t_GetScimV2GroupsIdQuerySchema,
    void,
    void
  >,
  respond: GetScimV2GroupsIdResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Group>
  | Response<404, t_ScimException>
>

export type PutScimV2GroupsIdResponder = {
  with200(): KoaRuntimeResponse<t_Group>
  with404(): KoaRuntimeResponse<t_ScimException>
} & KoaRuntimeResponder

export type PutScimV2GroupsId = (
  params: Params<
    t_PutScimV2GroupsIdParamSchema,
    t_PutScimV2GroupsIdQuerySchema,
    t_PutScimV2GroupsIdBodySchema,
    void
  >,
  respond: PutScimV2GroupsIdResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Group>
  | Response<404, t_ScimException>
>

export type PatchScimV2GroupsIdResponder = {
  with200(): KoaRuntimeResponse<t_Group>
  with404(): KoaRuntimeResponse<t_ScimException>
} & KoaRuntimeResponder

export type PatchScimV2GroupsId = (
  params: Params<
    t_PatchScimV2GroupsIdParamSchema,
    t_PatchScimV2GroupsIdQuerySchema,
    t_PatchScimV2GroupsIdBodySchema,
    void
  >,
  respond: PatchScimV2GroupsIdResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Group>
  | Response<404, t_ScimException>
>

export type DeleteScimV2GroupsIdResponder = {
  with204(): KoaRuntimeResponse<void>
  with404(): KoaRuntimeResponse<t_ScimException>
} & KoaRuntimeResponder

export type DeleteScimV2GroupsId = (
  params: Params<
    t_DeleteScimV2GroupsIdParamSchema,
    t_DeleteScimV2GroupsIdQuerySchema,
    void,
    void
  >,
  respond: DeleteScimV2GroupsIdResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<204, void>
  | Response<404, t_ScimException>
>

export type Implementation = {
  getScimV2Groups: GetScimV2Groups
  postScimV2Groups: PostScimV2Groups
  getScimV2GroupsId: GetScimV2GroupsId
  putScimV2GroupsId: PutScimV2GroupsId
  patchScimV2GroupsId: PatchScimV2GroupsId
  deleteScimV2GroupsId: DeleteScimV2GroupsId
}

export function createRouter(implementation: Implementation): KoaRouter {
  const router = new KoaRouter()

  const getScimV2GroupsQuerySchema = z.object({
    filter: z.string().optional(),
    excludedAttributes: z.string().optional(),
    count: z.coerce.number().optional(),
    startIndex: z.coerce.number().optional(),
  })

  const getScimV2GroupsResponseValidator = responseValidationFactory(
    [["200", s_GroupsListing]],
    undefined,
  )

  router.get("getScimV2Groups", "/scim/v2/Groups", async (ctx, next) => {
    const input = {
      params: undefined,
      query: parseRequestInput(
        getScimV2GroupsQuerySchema,
        ctx.query,
        RequestInputType.QueryString,
      ),
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_GroupsListing>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getScimV2Groups(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getScimV2GroupsResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const postScimV2GroupsBodySchema = s_CreateGroup

  const postScimV2GroupsResponseValidator = responseValidationFactory(
    [["201", s_Group]],
    undefined,
  )

  router.post("postScimV2Groups", "/scim/v2/Groups", async (ctx, next) => {
    const input = {
      params: undefined,
      query: undefined,
      body: parseRequestInput(
        postScimV2GroupsBodySchema,
        Reflect.get(ctx.request, "body"),
        RequestInputType.RequestBody,
      ),
      headers: undefined,
    }

    const responder = {
      with201() {
        return new KoaRuntimeResponse<t_Group>(201)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .postScimV2Groups(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = postScimV2GroupsResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const getScimV2GroupsIdParamSchema = z.object({id: z.string()})

  const getScimV2GroupsIdQuerySchema = z.object({
    excludedAttributes: z.string().optional(),
  })

  const getScimV2GroupsIdResponseValidator = responseValidationFactory(
    [
      ["200", s_Group],
      ["404", s_ScimException],
    ],
    undefined,
  )

  router.get("getScimV2GroupsId", "/scim/v2/Groups/:id", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        getScimV2GroupsIdParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: parseRequestInput(
        getScimV2GroupsIdQuerySchema,
        ctx.query,
        RequestInputType.QueryString,
      ),
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_Group>(200)
      },
      with404() {
        return new KoaRuntimeResponse<t_ScimException>(404)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getScimV2GroupsId(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getScimV2GroupsIdResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const putScimV2GroupsIdParamSchema = z.object({id: z.string()})

  const putScimV2GroupsIdQuerySchema = z.object({
    excludedAttributes: z.string().optional(),
  })

  const putScimV2GroupsIdBodySchema = s_Group

  const putScimV2GroupsIdResponseValidator = responseValidationFactory(
    [
      ["200", s_Group],
      ["404", s_ScimException],
    ],
    undefined,
  )

  router.put("putScimV2GroupsId", "/scim/v2/Groups/:id", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        putScimV2GroupsIdParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: parseRequestInput(
        putScimV2GroupsIdQuerySchema,
        ctx.query,
        RequestInputType.QueryString,
      ),
      body: parseRequestInput(
        putScimV2GroupsIdBodySchema,
        Reflect.get(ctx.request, "body"),
        RequestInputType.RequestBody,
      ),
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_Group>(200)
      },
      with404() {
        return new KoaRuntimeResponse<t_ScimException>(404)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .putScimV2GroupsId(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = putScimV2GroupsIdResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const patchScimV2GroupsIdParamSchema = z.object({id: z.string()})

  const patchScimV2GroupsIdQuerySchema = z.object({
    excludedAttributes: z.string().optional(),
  })

  const patchScimV2GroupsIdBodySchema = s_Patch

  const patchScimV2GroupsIdResponseValidator = responseValidationFactory(
    [
      ["200", s_Group],
      ["404", s_ScimException],
    ],
    undefined,
  )

  router.patch(
    "patchScimV2GroupsId",
    "/scim/v2/Groups/:id",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          patchScimV2GroupsIdParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          patchScimV2GroupsIdQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: parseRequestInput(
          patchScimV2GroupsIdBodySchema,
          Reflect.get(ctx.request, "body"),
          RequestInputType.RequestBody,
        ),
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_Group>(200)
        },
        with404() {
          return new KoaRuntimeResponse<t_ScimException>(404)
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .patchScimV2GroupsId(input, responder, ctx)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = patchScimV2GroupsIdResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const deleteScimV2GroupsIdParamSchema = z.object({id: z.string()})

  const deleteScimV2GroupsIdQuerySchema = z.object({
    excludedAttributes: z.string().optional(),
  })

  const deleteScimV2GroupsIdResponseValidator = responseValidationFactory(
    [
      ["204", z.undefined()],
      ["404", s_ScimException],
    ],
    undefined,
  )

  router.delete(
    "deleteScimV2GroupsId",
    "/scim/v2/Groups/:id",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          deleteScimV2GroupsIdParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          deleteScimV2GroupsIdQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with204() {
          return new KoaRuntimeResponse<void>(204)
        },
        with404() {
          return new KoaRuntimeResponse<t_ScimException>(404)
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .deleteScimV2GroupsId(input, responder, ctx)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = deleteScimV2GroupsIdResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  return router
}
