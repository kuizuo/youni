import { basePagerSchema } from '@server/common/dto/pager.dto'
import { TagOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const TagInputSchema = TagOptionalDefaultsSchema.pick({
  name: true,
  type: true,
})

export class TagDto extends createZodDto(TagInputSchema) { }

export class TagUpdateDto extends createZodDto(TagInputSchema.partial()) { }

export class TagPagerDto extends createZodDto(basePagerSchema.merge(
  TagInputSchema
    .pick({
      name: true,
    })
    .partial(),
)) { }

export class TagSearchDto extends createZodDto(basePagerSchema.extend({
  keyword: z.string().optional(), // .min(1, { message: '关键字不能为空' }),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),
})) { }
