import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { BizException } from 'src/common/exceptions/biz.exception'
import { ErrorCodeEnum } from 'src/constants/error-code.constant'
import { resourceNotFoundWrapper } from 'src/utils/prisma.util'

import { InteractType } from '../interact/interact.constant'
import { ViewService } from '../interact/services/view.service'

import { NoteTagDto, NoteTagPagerDto } from './note-tag.dto'

@Injectable()
export class NoteTagService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  constructor(
    private readonly viewService: ViewService,
  ) { }

  async paginate(dto: NoteTagPagerDto, userId?: string) {
    const { page, limit, name, sortBy, sortOrder = 'desc' } = dto
    const [items, meta] = await this.prisma.noteTag.paginate({
      where: {
        name: { contains: name },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withPages({ page, limit, includePageCount: true })

    return {
      items,
      meta,
    }
  }

  async search(dto: NoteTagPagerDto, userId?: string) {
    const { cursor, limit, name, sortBy, sortOrder = 'desc' } = dto

    const [items, meta] = await this.prisma.noteTag.paginate({
      where: {
        name: { contains: name },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withCursor({ limit, after: cursor })

    return {
      items,
      meta,
    }
  }

  async findOneById(id: string, userId: string) {
    const noteTag = await this.prisma.noteTag.findUniqueOrThrow({
      where: {
        id,
      },
    }).catch(
      resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.ResourceNotFound),
      ),
    )

    const viewCount = await this.increaseViewCount(noteTag.id, userId)

    return {
      ...noteTag,
      viewCount,
    }
  }

  async findOneByName(name: string, userId: string) {
    const noteTag = await this.prisma.noteTag.findUniqueOrThrow({
      where: {
        name,
      },
    }).catch(
      resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.ResourceNotFound),
      ),
    )

    const viewCount = await this.increaseViewCount(noteTag.id, userId)

    return {
      ...noteTag,
      viewCount,
    }
  }

  async increaseViewCount(id: string, userId: string) {
    await this.viewService.increase(InteractType.NoteTag, id, userId)

    const viewCount = await this.viewService.count(InteractType.NoteTag, id)
    return viewCount
  }

  async create(dto: NoteTagDto) {
    const { ...data } = dto
    return this.prisma.noteTag.create({
      data: {
        ...data,
      },
    })
  }

  async delete(id: string) {
    return this.prisma.noteTag.delete({
      where: {
        id,
      },
    })
  }
}
