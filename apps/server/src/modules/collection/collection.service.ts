import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { CollectionCursorDto, CollectionDto, CollectionItemQueryDto } from './collection.dto'

@Injectable()
export class CollectionService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate(
    dto: CollectionCursorDto,
    userId: string,
  ) {
    const { cursor, limit } = dto

    return await this.prisma.collection.paginate({
      where: {
        userId,
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })
  }

  async findOne(id: string) {
    return this.prisma.collection.findUnique({
      where: {
        id,
      },
    }).catch(
      resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.ResourceNotFound),
      ),
    )
  }

  async create(dto: CollectionDto, userId: string) {
    const { ...data } = dto

    await this.prisma.collection.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async createDefaultCollection(userId: string) {
    const exists = await this.prisma.collection.findFirst({
      where: {
        isDefault: true,
        userId,
      },
    })

    if (exists)
      return exists

    return await this.prisma.collection.create({
      data: {
        name: '我的收藏',
        isDefault: true,
        userId,
      },
    })
  }

  async getDefaultCollection(userId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        isDefault: true,
        userId,
      },
    })

    return (collection ?? await this.createDefaultCollection(userId))
  }

  async update(id: string, dto: CollectionDto) {
    const { ...data } = dto

    await this.prisma.collection.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }

  async delete(id: string) {
    await this.prisma.collection.delete({
      where: { id },
    })
  }

  async getItems(dto: CollectionItemQueryDto, userId: string) {
    const { collectionId, cursor, limit } = dto

    return await this.prisma.note.paginate({
      where: {
        collections: {
          some: {
            id: collectionId,
            userId,
          },
        },
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })
  }

  async addItem(itemId: string, userId: string) {
    const item = await this.prisma.note
      .findUniqueOrThrow({ where: { id: itemId } })
      .catch(resourceNotFoundWrapper(
        new BizException(ErrorCodeEnum.NoteNotFound),
      ))

    const defaultCollection = await this.getDefaultCollection(userId)

    await this.prisma.collection.update({
      where: {
        id: defaultCollection.id,
        userId,
      },
      data: {
        note: {
          connect: {
            id: item.id,
          },
        },
      },
    })
  }

  async deleteItem(itemId: string, userId: string) {
    const defaultCollection = await this.getDefaultCollection(userId)

    await this.prisma.collection.update({
      where: {
        id: defaultCollection.id,
        userId,
      },
      data: {
        note: {
          disconnect: {
            id: itemId,
          },
        },
      },
    })
  }

  async isItemInCollection(itemId: string, userId: string) {
    // const defaultCollection = await this.getDefaultCollection(userId)

    return await this.prisma.collection.exists({
      where: {
        // id: defaultCollection.id,
        note: {
          some: {
            id: itemId,
          },
        },
        userId,
      },
    })
  }

  async getItemCollectedCount(itemId: string) {
    return await this.prisma.collection.count({
      where: {
        note: {
          some: {
            id: itemId,
          },
        },
      },
    })
  }
}
