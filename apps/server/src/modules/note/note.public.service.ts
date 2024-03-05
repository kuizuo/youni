import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { Note } from '@youni/database'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'
import { CollectionService } from '../collection/collection.service'
import { InteractType } from '../interact/interact.constant'
import { LikeService } from '../interact/services/like.service'

import { InteractedNoteItem, NoteItem } from './note'
import { NoteCursorDto } from './note.dto'

@Injectable()
export class NotePublicService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  constructor(
    private likeService: LikeService,
    private collectionService: CollectionService,
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
        id: true,
        title: true,
        content: true,
        imageList: true,
        tags: true,
        user: true,
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
  async appendInteractInfo(item: Note | NoteItem, userId: string) {
    const [liked, likedCount, collected, collectedCount] = await Promise.all([
      this.likeService.getItemLiked(InteractType.Note, item.id, userId),
      this.likeService.getItemLikedCount(InteractType.Note, item.id),
      this.collectionService.isItemInCollection(item.id, userId),
      this.collectionService.getItemCollectedCount(item.id),
    ])

      ; (item as unknown as InteractedNoteItem).interactInfo = {
      liked,
      likedCount,
      collectedCount,
      collected,
      // commentCount,
    }

    return item
  }

  async appendInteractInfoList(items: Note[], userId: string) {
    return await Promise.all(items.map(item => this.appendInteractInfo(item, userId)))
  }
}
