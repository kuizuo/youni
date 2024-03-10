import { SnowflakeIdSchema } from '@server/common/dto/id.dto'
import { ImageSchema } from '@server/common/dto/image.dto'
import { baseCursorSchema } from '@server/common/dto/pager.dto'
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

export class NoteCursorDto extends createZodDto(baseCursorSchema.extend({
})) { }

export class UserNoteCursorDto extends createZodDto(baseCursorSchema.extend({
  userId: SnowflakeIdSchema,
})) { }
