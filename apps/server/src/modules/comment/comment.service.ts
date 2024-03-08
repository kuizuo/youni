import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { getIpLocation } from '@server/utils/ip.util'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { CommentRefType } from '@youni/database'

import { CursorPaginationMeta } from 'prisma-extension-pagination'

import { InteractType } from '../interact/interact.constant'
import { LikeService } from '../interact/services/like.service'
import { UserService } from '../user/user.service'

import { InteractedComment } from './comment'
import { CommentCursorDto, CreateCommentDto, SubCommentCursorDto } from './comment.dto'

@Injectable()
export class CommentService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  constructor(
    private readonly userService: UserService,
    private readonly likeService: LikeService,
  ) { }

  async paginate(dto: CommentCursorDto) {
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
      ...(cursor && { after: cursor }),
    })

    return { items, meta }
  }

  async paginateSubComment(dto: SubCommentCursorDto) {
    const { cursor, rootId, itemId, itemType, limit } = dto

    const [items, meta] = await this.prisma.comment.paginate({
      where: {
        refId: itemId,
        refType: itemType,
        parentId: rootId,
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
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
      },
    })
  }

  async getCommentCount(itemId: string, itemType: CommentRefType, parentId?: string) {
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

    return await this.prisma.comment.create({
      data: {
        refId: itemId,
        refType: itemType,
        content,
        parentId,
        userId,
      },
    })
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

  async delete(id: string) {
    return this.prisma.comment.delete({
      where: {
        id,
      },
    })
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
    return this.likeService.like(InteractType.Comment, itemId, userId)
  }

  async dislikeComment(itemId: string, userId: string) {
    return this.likeService.dislike(InteractType.Comment, itemId, userId)
  }

  async appendInteractInfo(item: InteractedComment, userId: string) {
    const [liked, likedCount, commentCount] = await Promise.all([
      this.likeService.getItemLiked(InteractType.Comment, item.id, userId),
      this.likeService.getItemlikedCount(InteractType.Comment, item.id),
      this.getCommentCount(item.refId, item.refType, item.parentId!),
    ])

    item.interactInfo = {
      liked,
      likedCount,
      commentCount,
    }

    return item
  }

  async appendInteractInfoList(items: InteractedComment[], userId: string) {
    return await Promise.all(items.map(item => this.appendInteractInfo(item, userId)))
  }
}
