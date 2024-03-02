import { basePagerSchema } from '@server/common/dto/pager.dto'
import { defaultSchemaOmit } from '@server/utils/zod.util'
import { NoteOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const NoteInputSchema = NoteOptionalDefaultsSchema.omit(defaultSchemaOmit)

export class NoteDto extends createZodDto(NoteInputSchema) { }

export class NoteUpdateDto extends createZodDto(NoteInputSchema.partial()) { }

export class NotePagerDto extends createZodDto(basePagerSchema.extend({
  sortBy: z.enum(['createdAt', 'updateAt']).optional(),
  // select: z.array(NoteSchema.keyof()).optional(),
})) { }
