import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { scheduleManager } from '@server/utils/schedule.util'

import { Note } from '@youni/database'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { CollectionService } from '../collection/collection.service'
import { CommentService } from '../comment/comment.service'
import { InteractType } from '../interact/interact.constant'
import { CountingService } from '../interact/services/counting.service'
import { LikeService } from '../interact/services/like.service'

import { NoteSelect } from './note.constant'
import { NoteCursorDto, UserNoteCursorDto } from './note.dto'

@Injectable()
export class NotePublicService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  constructor(
    private readonly likeService: LikeService,
    private readonly countingService: CountingService,
    private readonly commentService: CommentService,
    private readonly collectionService: CollectionService,
  ) { }

  async homeFeed(dto: NoteCursorDto, userId: string) {
    const { cursor, limit } = dto
    // FIXME: user analysis

    const [items, meta] = await this.prisma.note.paginate({
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

    return {
      items,
      meta,
    }
  }

  async getNoteById(id: string) {
    return await this.prisma.note.findUniqueOrThrow({
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
    const ok = await this.likeService.like(InteractType.Note, itemId, userId)

    if (ok) {
      scheduleManager.schedule(async () => {
        await this.countingService.updateLikeCount(InteractType.Note, itemId)
      })
    }
    return ok
  }

  async dislikeNote(itemId: string, userId: string) {
    const ok = await this.likeService.dislike(InteractType.Note, itemId, userId)

    if (ok) {
      scheduleManager.schedule(async () => {
        await this.countingService.updateLikeCount(InteractType.Note, itemId)
      })
    }

    return ok
  }

  async appendInteractInfo(items: Note | Note[], userId: string, includeCollected: boolean = false) {
    if (!Array.isArray(items))
      items = [items]

    const likedList = await Promise.all(items.map(item => this.likeService.getItemLiked(InteractType.Note, item.id, userId)))
    const collectedList = includeCollected ? await Promise.all(items.map(item => this.collectionService.isItemInCollection(item.id, userId))) : []

    items.forEach((item, index) => {
      item.interact.liked = likedList[index]
      if (includeCollected)
        item.interact.collected = collectedList[index]
    })
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
