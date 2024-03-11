import { SnowflakeIdSchema } from '@server/common/dto/id.dto'
import { basePagerSchema } from '@server/common/dto/pager.dto'
import { createZodDto } from 'nestjs-zod'

export class InteractPagerDto extends createZodDto(basePagerSchema.extend({
  id: SnowflakeIdSchema,
})) {}
