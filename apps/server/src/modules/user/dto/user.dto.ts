import { basePagerSchema } from '@server/common/dto/pager.dto'
import { UserOptionalDefaultsSchema } from '@youni/database/zod'

import { createZodDto } from 'nestjs-zod'

import { z } from 'zod'

const UserInputSchema = UserOptionalDefaultsSchema
  .omit({ campusId: true })
  .extend({
    username: z.string().min(4, '用户名长度过短'),
    avatar: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    desc: z.string().optional(),
    yoId: z.string().optional(),
  })

export class UserDto extends createZodDto(UserInputSchema) { }

export class UserUpdateDto extends createZodDto(UserInputSchema.partial()) { }

export class UserQueryDto extends createZodDto(
  basePagerSchema.extend({
    keyword: z.string().optional(),
    status: z.number().optional(),
  }),
) { }
