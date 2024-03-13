import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { NotificationAction, NotificationSourceType } from '@youni/database'

import { UserSelect } from '../user/user.constant'

import { CreateNotificationDto, NotificationPagerDto } from './notification.dto'

@Injectable()
export class NotificationService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  async paginate(dto: NotificationPagerDto, recipientId: string) {
    const { cursor, limit, action } = dto

    const [items, meta] = await this.prisma.notification.paginate({
      where: {
        action,
        recipientId,
      },
      select: {
        id: true,
        action: true,
        content: true,
        sourceId: true,
        sourceType: true,
        source: true,
        status: true,
        createdAt: true,
        sender: {
          select: UserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    await this.prisma.notification.updateMany({
      where: {
        id: { in: items.filter(item => item.status === 0).map(item => item.id) },
      },
      data: {
        status: 1,
      },
    })

    return {
      items,
      meta,
    }
  }

  async create(dto: CreateNotificationDto) {
    const { content, action, sourceId, sourceType, source, senderId, recipientId } = dto

    if (senderId === recipientId)
      return

    // TODO: use unique key to find
    const exists = await this.prisma.notification.findFirst({
      where: {
        content,
        action,
        sourceId,
        sourceType,
        senderId,
        recipientId,
      },
    })

    if (exists)
      return exists

    return await this.prisma.notification.create({
      data: {
        content,
        action,
        sourceId,
        sourceType,
        source,
        senderId,
        recipientId,
      },

    })
  }

  async delete(dto: { sourceId: string, sourceType: NotificationSourceType, action: NotificationAction, senderId: string, recipientId: string }) {
    const { sourceId, sourceType, action, senderId, recipientId } = dto

    const notification = await this.prisma.notification.findFirst({
      where: {
        sourceId,
        sourceType,
        action,
        senderId,
        recipientId,
      },
    })

    if (!notification)
      return

    return await this.prisma.notification.delete({
      where: {
        id: notification.id,
      },
    })
  }

  async count(recipientId: string) {
    const actions: NotificationAction[] = ['Like', 'Follow', 'Comment']

    let total = 0
    const results = await Promise.all(
      actions.map(async (action) => {
        const result = await this.prisma.notification.aggregate({
          where: {
            recipientId,
            action,
            status: 0,
          },
          _count: true,
        })
        total += result._count
        return { action, _count: result._count }
      }),
    )

    const count = results.reduce((obj, item) => {
      const key = item.action.toLocaleLowerCase()
      obj[key] = item._count
      return obj
    }, {}) as { like: number, follow: number, comment: number }

    return {
      count,
      total,
    }
  }
}
