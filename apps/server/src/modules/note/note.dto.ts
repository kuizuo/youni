import { baseCursorSchema } from '@server/common/dto/pager.dto'
import { defaultSchemaOmit } from '@server/utils/zod.util'
import { NoteOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'

export const NoteInputSchema = NoteOptionalDefaultsSchema.omit(defaultSchemaOmit)

export class NoteDto extends createZodDto(NoteInputSchema) { }

export class NoteUpdateDto extends createZodDto(NoteInputSchema.partial()) { }

export class NoteCursorDto extends createZodDto(baseCursorSchema.extend({
})) { }
