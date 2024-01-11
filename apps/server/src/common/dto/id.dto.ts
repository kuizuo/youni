import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SnowflakeIdSchema = z.string().regex(/^\d{16}$/)
export class SnowflakeIdDto extends createZodDto(
  z.object({
    id: SnowflakeIdSchema,
  }),
) {}

export const UUIdSchema = z.string().uuid()

export class IdDto extends createZodDto(
  z.object({
    id: UUIdSchema,
  }),
) {}
