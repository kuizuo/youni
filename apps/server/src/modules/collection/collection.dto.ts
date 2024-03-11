import { basePagerSchema } from '@server/common/dto/pager.dto'
import { CollectionOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CollectionInputSchema = CollectionOptionalDefaultsSchema.pick({
  name: true,
  description: true,
  isPublished: true,
})

export class CollectionDto extends createZodDto(CollectionInputSchema) { }

export class CollectionUpdateDto extends createZodDto(CollectionInputSchema.partial()) { }

export class CollectionPagerDto extends createZodDto(basePagerSchema.extend({
})) { }

export class CollectionItemQueryDto extends createZodDto(basePagerSchema.extend({
  collectionId: z.string(),
})) { }

export const CollectionItemSchema = z.object({
  itemId: z.string(),
  // collectionId: z.string(),
})

export class CollectionItemDto extends createZodDto(CollectionItemSchema) { }
