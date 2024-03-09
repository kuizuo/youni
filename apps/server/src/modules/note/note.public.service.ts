import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { CollectionService } from '../collection/collection.service'
import { CommentService } from '../comment/comment.service'
import { InteractType } from '../interact/interact.constant'
import { LikeService } from '../interact/services/like.service'

import { InteractedNote } from './note'
import { NoteSelect } from './note.constant'
import { NoteCursorDto, UserNoteCursorDto } from './note.dto'

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
        isPublished: true,
      },
      select: {
        ...NoteSelect,
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.NoteNotFound),
    ))
  }

  async getNotesByIds(ids: string[]) {
    return this.prisma.note.findMany({
      where: {
        id: { in: ids },
        isPublished: true,
      },
      select: {
        ...NoteSelect,
      },
    })
  }

  async likeNote(itemId: string, userId: string) {
    return this.likeService.like(InteractType.Note, itemId, userId)
  }

  async dislikeNote(itemId: string, userId: string) {
    return this.likeService.dislike(InteractType.Note, itemId, userId)
  }

  /**
   * 附加交互信息
   */
  async appendInteractInfo<T extends InteractedNote>(item: T, userId: string) {
    const [liked, likedCount, collected, collectedCount, commentCount] = await Promise.all([
      this.likeService.getItemLiked(InteractType.Note, item.id, userId),
      this.likeService.getItemlikedCount(InteractType.Note, item.id),
      this.collectionService.isItemInCollection(item.id, userId),
      this.collectionService.getItemCollectedCount(item.id),
      this.commentService.getCommentCount(item.id, 'Note'),
    ])

    item.interactInfo = {
      liked,
      likedCount,
      collectedCount,
      collected,
      commentCount,
    }

    return item
  }

  async appendInteractInfoList<T extends InteractedNote>(items: T[], userId: string) {
    return await Promise.all(items.map(item => this.appendInteractInfo(item, userId)))
  }

  async getNotesByUserId(dto: UserNoteCursorDto) {
    const { cursor, limit, userId } = dto

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        userId,
        isPublished: true,
      },
      select: {
        ...NoteSelect,
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })

    return { items, meta }
  }

  async getNotesByCollectionId(dto: UserNoteCursorDto) {
    const { cursor, limit, userId } = dto

    const defaultCollection = await this.collectionService.getDefaultCollection(userId)

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        collections: {
          some: {
            id: defaultCollection.id,
            userId,
          },
        },
        isPublished: true,
      },
      select: {
        ...NoteSelect,
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })

    return { items, meta }
  }

  async getUserLikedNotes(dto: UserNoteCursorDto) {
    const { cursor, limit, userId } = dto

    const { ids, meta } = await this.likeService.getUserLikedIds({ cursor, limit }, InteractType.Note, userId)

    const items = await this.getNotesByIds(ids)

    return { items, meta }
  }

  async getAllNoteIdsByUserId(userId: string) {
    const items = await this.prisma.note.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    })

    return items.map(item => item.id)
  }
}
