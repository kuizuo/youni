import { basePagerSchema } from '@server/common/dto/pager.dto'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class UserSearchDto extends createZodDto(basePagerSchema.extend({
  keyword: z.string(), // .min(1, { message: '关键字不能为空' }),
  sortBy: z.string().optional(),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),
})) { }
