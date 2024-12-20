/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import KoaRouter, {RouterContext} from "@koa/router"
import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import {
  KoaRuntimeResponder,
  KoaRuntimeResponse,
  Response,
  StatusCode,
} from "@nahkies/typescript-koa-runtime/server"
import {
  Params,
  responseValidationFactory,
} from "@nahkies/typescript-koa-runtime/zod"
import {t_ResourceTypes, t_Schemas, t_ServiceProviderConfig} from "../models"
import {s_ResourceTypes, s_Schemas, s_ServiceProviderConfig} from "../schemas"

export type GetScimV2ServiceProviderConfigResponder = {
  with200(): KoaRuntimeResponse<t_ServiceProviderConfig>
} & KoaRuntimeResponder

export type GetScimV2ServiceProviderConfig = (
  params: Params<void, void, void, void>,
  respond: GetScimV2ServiceProviderConfigResponder,
  ctx: RouterContext,
) => Promise<
  KoaRuntimeResponse<unknown> | Response<200, t_ServiceProviderConfig>
>

export type GetScimV2ResourceTypesResponder = {
  with200(): KoaRuntimeResponse<t_ResourceTypes>
} & KoaRuntimeResponder

export type GetScimV2ResourceTypes = (
  params: Params<void, void, void, void>,
  respond: GetScimV2ResourceTypesResponder,
  ctx: RouterContext,
) => Promise<KoaRuntimeResponse<unknown> | Response<200, t_ResourceTypes>>

export type GetScimV2SchemasResponder = {
  with200(): KoaRuntimeResponse<t_Schemas>
} & KoaRuntimeResponder

export type GetScimV2Schemas = (
  params: Params<void, void, void, void>,
  respond: GetScimV2SchemasResponder,
  ctx: RouterContext,
) => Promise<KoaRuntimeResponse<unknown> | Response<200, t_Schemas>>

export abstract class IntrospectionImplementation {
  abstract getScimV2ServiceProviderConfig: GetScimV2ServiceProviderConfig
  abstract getScimV2ResourceTypes: GetScimV2ResourceTypes
  abstract getScimV2Schemas: GetScimV2Schemas
}

export function createIntrospectionRouter(
  implementation: IntrospectionImplementation,
): KoaRouter {
  const router = new KoaRouter()

  const getScimV2ServiceProviderConfigResponseValidator =
    responseValidationFactory([["200", s_ServiceProviderConfig]], undefined)

  router.get(
    "getScimV2ServiceProviderConfig",
    "/scim/v2/ServiceProviderConfig",
    async (ctx, next) => {
      const input = {
        params: undefined,
        query: undefined,
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_ServiceProviderConfig>(200)
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .getScimV2ServiceProviderConfig(input, responder, ctx)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = getScimV2ServiceProviderConfigResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const getScimV2ResourceTypesResponseValidator = responseValidationFactory(
    [["200", s_ResourceTypes]],
    undefined,
  )

  router.get(
    "getScimV2ResourceTypes",
    "/scim/v2/ResourceTypes",
    async (ctx, next) => {
      const input = {
        params: undefined,
        query: undefined,
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_ResourceTypes>(200)
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .getScimV2ResourceTypes(input, responder, ctx)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = getScimV2ResourceTypesResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const getScimV2SchemasResponseValidator = responseValidationFactory(
    [["200", s_Schemas]],
    undefined,
  )

  router.get("getScimV2Schemas", "/scim/v2/Schemas", async (ctx, next) => {
    const input = {
      params: undefined,
      query: undefined,
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_Schemas>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getScimV2Schemas(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getScimV2SchemasResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  return router
}

export {createIntrospectionRouter as createRouter}
export {IntrospectionImplementation as Implementation}
