import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const DEFAULT_LIMIT = 10

export const basePagerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(DEFAULT_LIMIT),
  page: z.coerce.number().int().min(1).optional().default(1),
  sortBy: z.string().optional(),
  sortOrder: z.coerce
    .number()
    .or(z.literal(1))
    .or(z.literal(-1))
    .or(z.enum(['asc', 'desc']))
    .transform((val) => {
      if (val === 'asc')
        return 1
      if (val === 'desc')
        return -1
      return val
    })
    .optional(),
})

export class PagerDto extends createZodDto(basePagerSchema) {}

export const baseCursorSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(DEFAULT_LIMIT),
  cursor: z.coerce.string().optional().default(''),
})

export class CursorDto extends createZodDto(baseCursorSchema) {}
