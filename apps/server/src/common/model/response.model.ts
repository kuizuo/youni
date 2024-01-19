import { ApiProperty } from '@nestjs/swagger'

import {
  RESPONSE_SUCCESS_CODE,
  RESPONSE_SUCCESS_MSG,
} from '~/constants/response.constant'

export interface IBaseResponse<T = any> {
  ok?: boolean
  code?: number
  msg?: string
  data?: T
}

export class ResOp<T = any> {
  @ApiProperty({ type: 'boolean', default: true })
  ok: boolean

  @ApiProperty({ type: 'number', default: RESPONSE_SUCCESS_CODE })
  code: number

  @ApiProperty({ type: 'string', default: RESPONSE_SUCCESS_MSG })
  msg: string

  @ApiProperty({ type: 'object' })
  data?: T

  constructor({
    code,
    msg,
    ok,
    data,
  }: IBaseResponse<T>) {
    this.code = code ?? RESPONSE_SUCCESS_CODE
    this.msg = msg ?? RESPONSE_SUCCESS_MSG
    this.ok = ok ?? true

    if (data)
      this.data = data
  }
}
