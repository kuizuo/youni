import { TodoOptionalDefaultsSchema } from '@youni/prisma/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { basePagerSchema } from '~/common/dto/pager.dto'

export const TodoInputSchema = TodoOptionalDefaultsSchema.pick({
  value: true,
  status: true,
})

export class TodoDto extends createZodDto(TodoInputSchema) {}

export class TodoUpdateDto extends createZodDto(TodoInputSchema.partial()) {}

export class TodoPagerDto extends createZodDto(basePagerSchema.extend({
  sortBy: z.enum(['createdAt', 'updateAt']).optional(),
  // select: z.array(TodoSchema.keyof()).optional(),
})) {}
