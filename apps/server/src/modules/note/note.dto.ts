import { SnowflakeIdSchema } from '@server/common/dto/id.dto'
import { ImageSchema } from '@server/common/dto/image.dto'
import { basePagerSchema } from '@server/common/dto/pager.dto'
import { defaultSchemaOmit } from '@server/utils/zod.util'
import { NoteOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const NoteInputSchema = NoteOptionalDefaultsSchema
  .extend({
    title: z.string().min(1, { message: '标题不能为空' }),
    images: ImageSchema.array().min(1, { message: '至少需要一张图片' }),
    publishTime: z.coerce.date().optional().nullable(),
  })
  .omit(defaultSchemaOmit)

export class NoteDto extends createZodDto(NoteInputSchema) { }

export class NoteUpdateDto extends createZodDto(NoteInputSchema.partial()) { }

export class NotePagerDto extends createZodDto(basePagerSchema.extend({
})) { }

export class UserNotePagerDto extends createZodDto(basePagerSchema.extend({
  userId: SnowflakeIdSchema,
})) { }

export class NoteSearchDto extends createZodDto(basePagerSchema.extend({
  keyword: z.string().min(1, { message: '关键字不能为空' }),
  sortBy: z.string().optional(),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),
})) { }
