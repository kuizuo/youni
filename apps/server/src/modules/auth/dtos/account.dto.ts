import { strongPasswordSchema } from '@server/modules/user/dto/password.dto'
import { UserSchema } from '@youni/database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class UpdateProfileDto extends createZodDto(
  UserSchema.pick({
    nickname: true,
    avatar: true,
    phone: true,
  }).partial(),
) {}

export class ResetPasswordDto extends createZodDto(z.object({
  password: strongPasswordSchema,
})) {}
