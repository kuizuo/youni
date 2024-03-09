import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { NoteCursorDto, NoteDto, NoteUpdateDto } from './note.dto'

@Injectable()
export class NoteService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate(dto: NoteCursorDto, userId: string) {
    const { cursor, limit } = dto

    const [items, meta] = await this.prisma.note.paginate({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
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

  async findOne(id: string) {
    const note = await this.prisma.note.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        tags: {
          select: {
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.NoteNotFound),
    ))

    return note
  }

  async create(dto: NoteDto, userId: string) {
    const { images, ...data } = dto

    return this.prisma.note.create({
      data: {
        ...data,
        userId,
        images,
        cover: images![0],
        publishTime: new Date(),
      },
    })
  }

  async update(id: string, dto: NoteUpdateDto) {
    const { images, ...data } = dto
    return this.prisma.note.update({
      where: { id },
      data: {
        ...data,
        images,
        cover: images![0],
        publishTime: new Date(),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.note.delete({
      where: {
        id,
      },
    })
  }

  async batchDelete(ids: string[], userId: string) {
    const items = await this.prisma.note.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    })

    return items
  }
}
