import { MenuOptionalDefaultsSchema } from '@youni/prisma/zod'

import { createZodDto } from 'nestjs-zod'

const MenuInputSchema = MenuOptionalDefaultsSchema

export class MenuDto extends createZodDto(MenuInputSchema) { }

export class MenuUpdateDto extends createZodDto(MenuInputSchema.partial()) {}

export class MenuQueryDto extends createZodDto(MenuInputSchema) {}
