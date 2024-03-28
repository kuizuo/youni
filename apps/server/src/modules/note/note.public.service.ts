import { Injectable } from '@nestjs/common'

import { EventEmitter2 } from '@nestjs/event-emitter'
import { PagerDto } from '@server/common/dto/pager.dto'
import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { Note, Prisma } from '@youni/database'

import dayjs from 'dayjs'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { CollectionService } from '../collection/collection.service'
import { InteractType } from '../interact/interact.constant'
import { FollowService } from '../interact/services/follow.service'
import { LikeService } from '../interact/services/like.service'

import { NoteLikeEvent } from './events/note-like.event'
import { NoteEvents, NoteSelect } from './note.constant'
import { NoteByTagDto, NotePagerDto, NoteSearchDto, UserNotePagerDto } from './note.dto'

@Injectable()
export class NotePublicService {
  @InjectPrismaClient()
  private readonly prisma: ExtendedPrismaClient

  constructor(
    private readonly likeService: LikeService,
    private readonly collectionService: CollectionService,
    private readonly followService: FollowService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async homeFeed(dto: NotePagerDto, userId: string) {
    const { cursor, limit } = dto

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        isPublished: true,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        publishTime: 'desc',
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return {
      items,
      meta,
    }
  }

  async followFeed(dto: NotePagerDto, userId: string) {
    const { cursor, limit } = dto

    // 获取当前用户所有关注
    const followIds = await this.followService.getAllFollowingIds(userId)

    // 近 3 天前动态
    const threeDaysAgo = dayjs().subtract(7, 'day').toDate()

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        isPublished: true,
        publishTime: {
          gte: threeDaysAgo,
        },
        userId: { in: followIds },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        publishTime: 'desc',
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return {
      items,
      meta,
    }
  }

  async search(dto: NoteSearchDto, userId: string) {
    const { keyword, cursor, limit, sortBy = 'createdAt', sortOrder = 'desc' } = dto

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        OR: [{
          title: {
            contains: keyword,
          },
        }],
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withCursor({
      limit,
      after: cursor,
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
    return await this.prisma.note.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        ...NoteSelect,
      },
    })
  }

  async getNotesByTag(dto: NoteByTagDto) {
    const { tag, cursor, limit, sortBy, sortOrder = 'desc' } = dto

    const where: Prisma.NoteWhereInput = {
      isPublished: true,
      tags: {
        some: {
          name: tag,
        },
      },
    }

    const [items, meta] = await this.prisma.note.paginate({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        ...NoteSelect,
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return {
      items,
      meta,
    }
  }

  async likeNote(itemId: string, userId: string) {
    const note = await this.getNoteById(itemId)

    const ok = await this.likeService.like(InteractType.Note, note.id, userId)

    if (ok) {
      this.eventEmitter.emit(NoteEvents.NoteLike, new NoteLikeEvent({
        note: note as unknown as Note,
        senderId: userId,
      }))
    }

    return true
  }

  async dislikeNote(itemId: string, userId: string) {
    const note = await this.getNoteById(itemId)

    const ok = await this.likeService.dislike(InteractType.Note, note.id, userId)

    if (ok) {
      this.eventEmitter.emit(NoteEvents.NoteDislike, new NoteLikeEvent({
        note: note as unknown as Note,
        senderId: userId,
      }))
    }

    return true
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

  async getNotesByUserId(dto: UserNotePagerDto) {
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
      after: cursor,
    })

    return { items, meta }
  }

  async getNotesByCollectionId(dto: UserNotePagerDto) {
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
      after: cursor,
    })

    return { items, meta }
  }

  async getUserLikedNotes(dto: UserNotePagerDto) {
    const { cursor, limit, userId } = dto

    const { ids, meta } = await this.likeService.getUserLikedIds({ cursor, limit } as PagerDto, InteractType.Note, userId)

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
