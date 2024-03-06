import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { Prisma } from '@youni/database'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { CollectionService } from '../collection/collection.service'
import { CommentService } from '../comment/comment.service'
import { InteractType } from '../interact/interact.constant'
import { LikeService } from '../interact/services/like.service'

import { InteractedNote } from './note'
import { NoteCursorDto } from './note.dto'

const NoteSelect: Prisma.NoteSelect = {
  id: true,
  title: true,
  content: true,
  imageList: true,
  tags: true,
  user: true,
  updatedAt: true,
}

@Injectable()
export class NotePublicService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  constructor(
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly collectionService: CollectionService,
  ) { }

  async homeFeed(dto: NoteCursorDto, userId: string) {
    const { cursor, limit } = dto
    // FIXME: user analysis

    return this.prisma.note.paginate({
      include: {
        user: {
          select: {
            nickname: true,
            avatar: true,
          },
        },
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })
  }

  async getNoteById(id: string) {
    return this.prisma.note.findUniqueOrThrow({
      where: {
        id,
        published: true,
      },
      select: {
        ...NoteSelect,
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.NoteNotFound),
    ))
  }

  async likeNote(itemId: string, userId: string) {
    return this.likeService.like(InteractType.Note, itemId, userId)
  }

  /**
   * 附加交互信息
   */
  async appendInteractInfo<T extends InteractedNote>(item: T, userId: string) {
    const [liked, likeCount, collected, collectedCount, commentCount] = await Promise.all([
      this.likeService.getItemLiked(InteractType.Note, item.id, userId),
      this.likeService.getItemlikeCount(InteractType.Note, item.id),
      this.collectionService.isItemInCollection(item.id, userId),
      this.collectionService.getItemCollectedCount(item.id),
      this.commentService.getCommentCount(item.id, 'Note'),
    ])

    item.interactInfo = {
      liked,
      likeCount,
      collectedCount,
      collected,
      commentCount,
    }

    return item
  }

  async appendInteractInfoList<T extends InteractedNote>(items: T[], userId: string) {
    return await Promise.all(items.map(item => this.appendInteractInfo(item, userId)))
  }

  async getNotesByIds(ids: string[]) {
    return this.prisma.note.findMany({
      where: {
        id: { in: ids },
        published: true,
      },
      select: {
        ...NoteSelect,
      },
    })
  }
}
