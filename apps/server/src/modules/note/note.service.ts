import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { NoteDto, NotePagerDto, NoteUpdateDto } from './note.dto'

@Injectable()
export class NoteService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate({
    page,
    limit,
  }: NotePagerDto, userId?: string) {
    const [items, meta] = await this.prisma.note.paginate({
      where: {
        ...(userId && { userId }),
      },
    }).withPages({ page, limit, includePageCount: true })

    return {
      items,
      meta,
    }
  }

  async findOne(id: string) {
    return this.prisma.note.findUniqueOrThrow({
      where: {
        id,
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.NoteNotFound),
    ))
  }

  async create(dto: NoteDto, userId: string) {
    const { ...data } = dto

    return this.prisma.note.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async update(id: string, dto: NoteUpdateDto) {
    return this.prisma.note.update({
      where: { id },
      data: {
        ...dto,
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
