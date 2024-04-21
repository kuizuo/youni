import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { BizException } from 'src/common/exceptions/biz.exception'
import { ErrorCodeEnum } from 'src/constants/error-code.constant'
import { resourceNotFoundWrapper } from 'src/utils/prisma.util'

import { InteractType } from '../interact/interact.constant'
import { ViewService } from '../interact/services/view.service'

import { TagDto, TagPagerDto, TagSearchDto } from './tag.dto'

@Injectable()
export class TagService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  constructor(
    private readonly viewService: ViewService,
  ) { }

  async paginate(dto: TagPagerDto, userId?: string) {
    const { page, limit, name, sortBy, sortOrder = 'desc' } = dto
    const [items, meta] = await this.prisma.tag.paginate({
      where: {
        ...(name && { name: { contains: name } }),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            notes: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withPages({ page, limit, includePageCount: true })

    const promises = items.map(async (item) => {
      const viewCount = await this.viewService.count(InteractType.Tag, item.id)

        // FIXME:
        ; (item as any).viewCount = viewCount
    })

    await Promise.all(promises)

    return {
      items,
      meta,
    }
  }

  async search(dto: TagSearchDto, userId?: string) {
    const { cursor, limit, keyword, sortBy, sortOrder = 'desc' } = dto

    const [items, meta] = await this.prisma.tag.paginate({
      where: {
        name: { contains: keyword },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withCursor({ limit, after: cursor })

    const promises = items.map(async (item) => {
      const viewCount = await this.viewService.count(InteractType.Tag, item.id)

        // FIXME:
        ; (item as any).viewCount = viewCount
    })

    await Promise.all(promises)

    return {
      items,
      meta,
    }
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUniqueOrThrow({
      where: {
        id,
      },
    }).catch(
      resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.ResourceNotFound),
      ),
    )

    const viewCount = await this.increaseViewCount(tag.id, userId)

    return {
      ...tag,
      viewCount,
    }
  }

  async findOneByName(name: string, userId: string) {
    const tag = await this.prisma.tag.findUniqueOrThrow({
      where: {
        name,
      },
    }).catch(
      resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.ResourceNotFound),
      ),
    )

    const viewCount = await this.increaseViewCount(tag.id, userId)

    return {
      ...tag,
      viewCount,
    }
  }

  async increaseViewCount(id: string, userId: string) {
    await this.viewService.increase(InteractType.Tag, id, userId)

    const viewCount = await this.viewService.count(InteractType.Tag, id)
    return viewCount
  }

  async create(dto: TagDto) {
    const { ...data } = dto
    return this.prisma.tag.create({
      data: {
        ...data,
      },
    })
  }

  async delete(id: string) {
    return this.prisma.tag.delete({
      where: {
        id,
      },
    })
  }

  async batchDelete(ids: string[]) {
    const items = await this.prisma.tag.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return items
  }
}
