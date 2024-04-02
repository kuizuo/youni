import { basePagerSchema } from '@server/common/dto/pager.dto'
import { CampusOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { ImageSchema } from 'src/common/dto/image.dto'
import { z } from 'zod'

export const CampusInputSchema = CampusOptionalDefaultsSchema.extend({
  carousels: ImageSchema.array().min(1, { message: '至少需要一张图片' }),
})

export class CampusDto extends createZodDto(CampusInputSchema) { }

export class CampusUpdateDto extends createZodDto(CampusInputSchema.partial()) { }

export class CampusPagerDto extends createZodDto(basePagerSchema.extend({
  sortBy: z.enum(['createdAt', 'updateAt']).optional(),
  // select: z.array(CampusSchema.keyof()).optional(),
})) { }

export class CampusSearchDto extends createZodDto(z.object({
  name: z.string(),
})) { }
