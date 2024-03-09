import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ImageSchema = z.object({
  src: z.string(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
})

export const ImagesSchema = z.array(ImageSchema)

export class ImagesDto extends createZodDto(ImagesSchema) {}

export type Image = z.infer<typeof ImageSchema>
