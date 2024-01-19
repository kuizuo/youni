import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'

import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { isDev } from '~/global/env'

import { ResOp } from '../model/response.model'

interface myError {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor() {
    this.registerCatchAllExceptionsHook()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<FastifyRequest>()
    const response = ctx.getResponse<FastifyReply>()

    if (request.method === 'OPTIONS')
      return response.status(HttpStatus.OK).send()

    const url = request.raw.url!

    const status
      = exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status
        || (exception as myError)?.statusCode
        || HttpStatus.INTERNAL_SERVER_ERROR

    let msg
      = (exception as any)?.response?.message
      || (exception as myError)?.message
      || `${exception}`

    // 系统内部错误时
    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR
      && !(exception instanceof BizException)
    ) {
      Logger.error(exception, undefined, 'Catch')

      // 生产环境下隐藏错误信息
      if (!isDev)
        msg = ErrorEnum.SERVER_ERROR?.split(':')[1]
    }
    else {
      this.logger.warn(
        `错误信息：(${status}) ${msg} Path: ${decodeURI(url)}`,
      )
    }

    const errorCode: number
      = exception instanceof BizException ? exception.getErrorCode() : status

    // 返回基础响应结果
    const resBody = new ResOp({
      code: errorCode,
      msg,
      ok: false,
    })

    response.status(status).type('application/json').send(resBody)
  }

  registerCatchAllExceptionsHook() {
    process.on('unhandledRejection', (reason) => {
      console.error('unhandledRejection: ', reason)
    })

    process.on('uncaughtException', (err) => {
      console.error('uncaughtException: ', err)
    })
  }
}
