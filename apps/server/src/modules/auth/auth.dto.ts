import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

export const LoginTypeEnum = z.enum(['account', 'email', 'mobile'])

export const CredentialsSchema = z.object({
  username: z.string().min(4).max(255),
  password: z.password().min(6).atLeastOne('digit'),
  type: LoginTypeEnum,
})

export class LoginDto extends createZodDto(CredentialsSchema) {}

export class RegisterDto extends createZodDto(CredentialsSchema.extend({
  // ...
})) {}
