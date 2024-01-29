import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const DEFAULT_LIMIT = 10

export const basePagerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(DEFAULT_LIMIT).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
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
  limit: z.coerce.number().int().min(1).max(20).default(DEFAULT_LIMIT).optional(),
  cursor: z.coerce.number().int().min(0).default(0).optional(),
})

export class CursorDto extends createZodDto(baseCursorSchema) {}
