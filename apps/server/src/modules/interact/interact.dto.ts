import { SnowflakeIdSchema } from '@server/common/dto/id.dto'
import { baseCursorSchema } from '@server/common/dto/pager.dto'
import { createZodDto } from 'nestjs-zod'

export class InteractCursorDto extends createZodDto(baseCursorSchema.extend({
  id: SnowflakeIdSchema,
})) {}
