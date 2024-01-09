import { TodoOptionalDefaultsSchema, TodoSchema } from '@youni/prisma/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { baseCursorSchema } from '~/common/dto/pager.dto'

const TodoInputSchema = TodoOptionalDefaultsSchema.extend({
})

export class TodoDto extends createZodDto(TodoInputSchema) {}

export class TodoUpdateDto extends createZodDto(TodoInputSchema.partial()) {}

export class TodoCursorDto extends createZodDto(baseCursorSchema.extend({
  sortBy: z.enum(['createdAt', 'updateAt']).optional(),
  select: z.array(TodoSchema.keyof()).optional(),
})) {}
