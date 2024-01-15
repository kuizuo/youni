import { RoleOptionalDefaultsSchema } from '@youni/prisma/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { defaultSchemaOmit } from '~/utils/zod.util'

export const RoleInputSchema = RoleOptionalDefaultsSchema.extend({
  menuIds: z.array(z.string()).optional().default([]),
}).omit(defaultSchemaOmit)

export class RoleDto extends createZodDto(RoleInputSchema) {}

export class RoleUpdateDto extends createZodDto(RoleInputSchema.partial()) {}
