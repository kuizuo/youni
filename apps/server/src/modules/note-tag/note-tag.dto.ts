import { basePagerSchema } from '@server/common/dto/pager.dto'
import { NoteTagOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const NoteTagInputSchema = NoteTagOptionalDefaultsSchema.pick({
  name: true,
  type: true,
})

export class NoteTagDto extends createZodDto(NoteTagInputSchema) {}

export class NoteTagUpdateDto extends createZodDto(NoteTagInputSchema.partial()) {}

export class NoteTagPagerDto extends createZodDto(basePagerSchema.extend({
  name: z.string().optional(),
})) {}

export class NoteTagSearchDto extends createZodDto(basePagerSchema.extend({
  keyword: z.string(), // .min(1, { message: '关键字不能为空' }),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),
})) { }
