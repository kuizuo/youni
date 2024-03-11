import { basePagerSchema } from '@server/common/dto/pager.dto'
import { createZodDto } from 'nestjs-zod'

export class HistoryPagerDto extends createZodDto(basePagerSchema.extend({
})) { }
