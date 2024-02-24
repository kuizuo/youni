import { basePagerSchema } from '@server/common/dto/pager.dto'
import { UserOptionalDefaultsSchema } from '@youni/database/zod'

import { createZodDto } from 'nestjs-zod'

import { z } from 'zod'

const UserInputSchema = UserOptionalDefaultsSchema.extend({
  phone: z.string().optional(),
  remark: z.string().optional(),
})

export class UserDto extends createZodDto(UserInputSchema) {}

export class UserUpdateDto extends createZodDto(UserInputSchema.partial()) {}

export class UserQueryDto extends createZodDto(
  basePagerSchema
    .extend({
      keyword: z.string().optional(),
      status: z.number().optional(),
    }),
) {}
