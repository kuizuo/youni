import { SnowflakeIdSchema } from '@server/common/dto/id.dto'
import { basePagerSchema } from '@server/common/dto/pager.dto'
import { CommentSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { CommentRefType } from './comment.constant'

export const CreateCommentInputSchema = CommentSchema.pick({
  content: true,
}).extend({
  parentId: SnowflakeIdSchema.optional().nullable(),
  itemId: SnowflakeIdSchema,
  itemType: z.nativeEnum(CommentRefType),
})

export class CreateCommentDto extends createZodDto(CreateCommentInputSchema) { }

export const CommentCursorSchema = basePagerSchema.extend({
  itemId: SnowflakeIdSchema,
  itemType: z.nativeEnum(CommentRefType),
})

export class CommentPagerDto extends createZodDto(CommentCursorSchema) { }

export class SubCommentPagerDto extends createZodDto(CommentCursorSchema.extend({
  rootId: SnowflakeIdSchema,
})) { }
