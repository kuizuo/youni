import { BizException } from '@server/common/exceptions/biz.exception'
import { inferRouterInputs, inferRouterOutputs, initTRPC } from '@trpc/server'
import { z } from 'zod'

import { Context } from './trpc.context'
import { Meta } from './trpc.meta'
import { TRPCService } from './trpc.service'

export const trpc = initTRPC.context<Context>().meta<Meta>().create({
  errorFormatter(opts) {
    const { shape, error, ctx } = opts
    let bizMessage = ''
    let code = undefined as number | undefined

    if (error.cause instanceof BizException) {
      const BizError = error.cause

      bizMessage
        = BizError.message
      code = BizError.bizCode
    }

    if (error.cause instanceof z.ZodError) {
      bizMessage = Array.from(
        Object.keys(error.cause.flatten().fieldErrors),
      )[0][0]
    }

    return {
      ...shape,
      message: bizMessage || shape.message,
      data: {},
    }
  },
})
export type TRPCRouterType = (typeof trpc)['router']
export type TRPCProcedure = (typeof trpc)['procedure']
export type TRPC$Config = typeof trpc._config

export type AppRouter = TRPCService['appRouter']
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
