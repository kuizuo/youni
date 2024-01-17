import { UserOptionalDefaultsSchema } from '@youni/prisma/zod'

import { createZodDto } from 'nestjs-zod'

import { z } from 'zod'

import { basePagerSchema } from '~/common/dto/pager.dto'

const UserInputSchema = UserOptionalDefaultsSchema.extend({
  phone: z.string().optional(),
  remark: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
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
