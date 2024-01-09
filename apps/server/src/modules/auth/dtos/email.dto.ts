import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { strongPasswordSchema } from '~/modules/user/dto/password.dto'

export const EmailLoginSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(4),
})

export class EmailLoginDto extends createZodDto(EmailLoginSchema) {}

export class EmailRegisterDto extends createZodDto(
  EmailLoginSchema.extend({
    password: strongPasswordSchema,
  }),
) {}
