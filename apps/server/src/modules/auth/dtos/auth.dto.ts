import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const CredentialsSchema = z.object({
  username: z.string().min(4).max(255),
  password: z.password().min(6).atLeastOne('digit'),
})

export class PasswordLoginDto extends createZodDto(CredentialsSchema) {}

export class RegisterDto extends createZodDto(CredentialsSchema.extend({
  // ...
})) {}
