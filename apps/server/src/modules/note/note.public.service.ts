import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { NoteCursorDto } from './note.dto'

@Injectable()
export class NotePublicService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async homeFeed(dto: NoteCursorDto, userId: string) {
    const { cursor, limit } = dto
    // FIXME: user analysis

    return this.prisma.note.paginate({
      include: {
        user: {
          select: {
            nickname: true,
            avatar: true,
          }
        }
      }
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
}
