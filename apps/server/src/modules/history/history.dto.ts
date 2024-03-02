import { baseCursorSchema } from '@server/common/dto/pager.dto'
import { createZodDto } from 'nestjs-zod'

export class HistoryCursorDto extends createZodDto(baseCursorSchema.extend({
})) { }
