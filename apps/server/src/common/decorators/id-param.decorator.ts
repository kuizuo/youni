import { Param } from '@nestjs/common'

export function IdParam() {
  return Param('id')
}
