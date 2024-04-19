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
    tags: z.string().array().default([]),
    campusId: SnowflakeIdSchema.optional(),
    isAppendCampus: z.boolean().optional(),
  })
  .omit(defaultSchemaOmit)

export class NoteDto extends createZodDto(NoteInputSchema) { }

export class NoteUpdateDto extends createZodDto(NoteInputSchema.partial()) { }

export class NotePagerDto extends createZodDto(basePagerSchema.merge(
  NoteInputSchema
    .pick({
      title: true,
      tags: true,
      state: true,
    })
    .extend({
      tags: z.string().optional(),
      startTime: z.string().optional()
        .refine(val => !val || !Number.isNaN(Date.parse(val)), {
          message: 'Invalid date format for startTime',
        })
        .transform(val => val ? new Date(val) : undefined),
      endTime: z.string().optional()
        .refine(val => !val || !Number.isNaN(Date.parse(val)), {
          message: 'Invalid date format for endTime',
        })
        .transform(val => val ? new Date(val) : undefined),
    })
    .partial(),
)) { }

export class UserNotePagerDto extends createZodDto(basePagerSchema.extend({
  userId: SnowflakeIdSchema,
})) { }

export class NoteSearchDto extends createZodDto(basePagerSchema.extend({
  keyword: z.string().optional(), // .min(1, { message: '关键字不能为空' }),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),
})) { }

export class NoteByTagDto extends createZodDto(basePagerSchema.extend({
  tag: z.string(),
})) { }

export class NoteByCampusDto extends createZodDto(basePagerSchema.extend({
  campusId: z.string(),
})) { }
