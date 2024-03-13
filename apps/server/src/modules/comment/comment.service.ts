import { Injectable } from '@nestjs/common'

import { EventEmitter2 } from '@nestjs/event-emitter'
import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { getIpLocation } from '@server/utils/ip.util'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { scheduleManager } from '@server/utils/schedule.util'
import { Comment, CommentRefType } from '@youni/database'

import { CursorPaginationMeta } from 'prisma-extension-pagination'

import { InteractType } from '../interact/interact.constant'
import { CountingService } from '../interact/services/counting.service'
import { LikeService } from '../interact/services/like.service'

import { CommentEvents } from './comment.constant'
import { CommentPagerDto, CreateCommentDto, SubCommentPagerDto } from './comment.dto'
import { CommentCreateEvent } from './events/comment-create.event'

@Injectable()
export class CommentService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  constructor(
    private readonly likeService: LikeService,
    private readonly countingService: CountingService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async paginate(dto: CommentPagerDto) {
    const { cursor, limit, itemId, itemType } = dto
    const ref = await this.getItemById(itemId, itemType)

    if (!ref) {
      return {
        items: [],
        meta: {
          startCursor: null,
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        } as CursorPaginationMeta,
      }
    }

    const [items, meta] = await this.prisma.comment.paginate({
      where: {
        refId: ref.id,
        refType: itemType,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            avatar: true,
            nickname: true,
          },
        },
        children: {
          take: 1, // 只返回一条记录,更多则需要展开查看
          select: {
            content: true,
            createdAt: true,
            refId: true,
            refType: true,
            location: true,
            user: {
              select: {
                id: true,
                avatar: true,
                nickname: true,
              },
            },
            parent: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    avatar: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return { items, meta }
  }

  async paginateSubComment(dto: SubCommentPagerDto) {
    const { cursor, rootId, itemId, itemType, limit } = dto

    const [items, meta] = await this.prisma.comment.paginate({
      where: {
        refId: itemId,
        refType: itemType,
        parentId: rootId,
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return { items, meta }
  }

  async getCommentById(id: string) {
    return this.prisma.comment.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        children: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })
  }

  async getCommentCount(itemType: CommentRefType, itemId: string, parentId?: string) {
    return this.prisma.comment.count({
      where: {
        refId: itemId,
        refType: itemType,
        ...(parentId && { parentId }),
      },
    })
  }

  async createComment(dto: CreateCommentDto, userId: string) {
    const { content, itemId, itemType, parentId } = dto

    const ref = await this.getItemById(itemId, itemType)

    if (!ref)
      throw new BizException(ErrorCodeEnum.ResourceNotFound)

    let recipientId = ref.userId
    if (parentId) {
      const parentComment = await this.prisma.comment.findUniqueOrThrow({
        where: {
          id: parentId,
        },
      })
      recipientId = parentComment.userId
    }

    const comment = await this.prisma.comment.create({
      data: {
        refId: itemId,
        refType: itemType,
        content,
        parentId,
        userId,
      },
    })

    this.eventEmitter.emit(CommentEvents.CommentCreate, new CommentCreateEvent({
      ref,
      comment,
      senderId: userId,
      recipientId,
    }))

    return comment
  }

  async deleteComment(id: string) {
    const comment = await this.prisma.comment.delete({
      where: {
        id,
      },
    })

    scheduleManager.schedule(async () => {
      const count = await this.getCommentCount(comment.refType, comment.refId)
      await this.countingService.updateCollectionCount(InteractType.Note, comment.refId, count)
    })

    return comment
  }

  async getItemById(itemId: string, itemType: CommentRefType) {
    switch (itemType) {
      case CommentRefType.Note:
        return this.prisma.note.findUniqueOrThrow({
          where: {
            id: itemId,
          },
        }).catch(resourceNotFoundWrapper(
          new BizException(ErrorCodeEnum.NoteNotFound),
        ))
      // case CommentRefType.xxx:
    }
  }

  async appendIpLocation(id: string, ip: string) {
    if (!ip)
      return

    const comment = this.prisma.comment.findUnique({
      where: {
        id,
      },
    })

    if (!comment)
      return

    const location = await getIpLocation(ip)

    await this.prisma.comment.update({
      where: { id },
      data: {
        ip,
        location,
      },
    })
  }

  async likeComment(itemId: string, userId: string) {
    const ok = await this.likeService.like(InteractType.Comment, itemId, userId)

    if (ok) {
      scheduleManager.schedule(async () => {
        await this.countingService.updateLikeCount(InteractType.Comment, itemId)
      })
    }

    return ok
  }

  async dislikeComment(itemId: string, userId: string) {
    const ok = await this.likeService.dislike(InteractType.Comment, itemId, userId)

    if (ok) {
      scheduleManager.schedule(async () => {
        await this.countingService.updateLikeCount(InteractType.Comment, itemId)
      })
    }

    return ok
  }

  async appendInteractInfo(items: Comment | Comment[], userId: string) {
    if (!Array.isArray(items))
      items = [items]

    const likedList = await Promise.all(items.map(item => this.likeService.getItemLiked(InteractType.Comment, item.id, userId)))

    items.forEach((item, index) => {
      item.interact.liked = likedList[index]
    })
  }
}
