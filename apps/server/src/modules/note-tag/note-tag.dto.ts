import { basePagerSchema } from '@server/common/dto/pager.dto'
import { NoteTagOptionalDefaultsSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'

export const NoteTagInputSchema = NoteTagOptionalDefaultsSchema.pick({
  name: true,
  type: true,
})

export class NoteTagDto extends createZodDto(NoteTagInputSchema) {}

export class NoteTagUpdateDto extends createZodDto(NoteTagInputSchema.partial()) {}

export class NoteTagPagerDto extends createZodDto(basePagerSchema.extend({
})) {}
