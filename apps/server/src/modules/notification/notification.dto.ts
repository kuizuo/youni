import { basePagerSchema } from '@server/common/dto/pager.dto'
import { NotificationAction, NotificationSourceType } from '@youni/database'
import { NotificationSchema } from '@youni/database/zod'

import { createZodDto } from 'nestjs-zod'

import { z } from 'zod'

export const NotificationInputSchema = NotificationSchema.pick({
  action: true,
  content: true,
  sourceId: true,
  sourceType: true,
  source: true,
  senderId: true,
  recipientId: true,
}).extend({
  content: z.string().optional().default(''),
  sourceId: z.string().optional(),
  sourceType: z.nativeEnum(NotificationSourceType).optional(),
})

export class CreateNotificationDto extends createZodDto(NotificationInputSchema) {

}

export const NotificationPagerSchema = basePagerSchema.extend({
  action: z.nativeEnum(NotificationAction),
})

export class NotificationPagerDto extends createZodDto(NotificationPagerSchema) { }
