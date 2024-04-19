import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { snowflake } from '@server/shared/database/snowflake.util'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { CampusService } from '../campus/campus.service'

import { NoteDto, NotePagerDto, NoteUpdateDto } from './note.dto'

@Injectable()
export class NoteService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  constructor(private readonly campusService: CampusService) { }

  async paginate(dto: NotePagerDto, userId: string) {
    const { page, limit } = dto

    const [items, meta] = await this.prisma.note.paginate({
      include: {
        tags: true,
        user: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }).withPages({
      page,
      limit,
      includePageCount: true,
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
    const { images, tags, isAppendCampus, ...data } = dto

    // await this.prisma.noteTag.createMany({
    //   data: tags.map(tag => ({
    //     name: tag,
    //     type: 'topic',
    //   })),
    //   skipDuplicates: true,
    // })

    // for await (const image of images) {
    //   if (image.src.startsWith('data:image/png;base64,')) {
    //     const readableStream = new Readable()

    //     // 将base64字符串写入可读流
    //     readableStream.push(Buffer.from(image.src, 'base64'))
    //     readableStream.push(null)

    //     const filename = customAlphabet(alphabet)(18) + '.png'.toLowerCase()
    //     await this.fileService.writeFile(FileTypeEnum.photo, filename, readableStream)
    //     const url = await this.fileService.resolveFileUrl(FileTypeEnum.photo, filename)
    //     image.src = url
    //   }
    // }

    // if (campusId) {
    //   const campus = await this.prisma.campus.findUniqueOrThrow({
    //     where: {
    //       id: campusId,
    //     },
    //   })
    // }

    const campusId = isAppendCampus ? (await this.campusService.getCampusByUserId(userId))?.id : null

    return this.prisma.note.create({
      data: {
        ...data,
        userId,
        images,
        cover: images![0],
        publishTime: new Date(),
        campusId,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: {
              name: tag,
            },
            create: {
              id: snowflake.nextId(),
              name: tag,
              type: 'topic',
            },
          })),
        },
      },
    })
  }

  async update(id: string, dto: NoteUpdateDto) {
    const { images, tags, ...data } = dto
    return this.prisma.note.update({
      where: { id },
      data: {
        ...data,
        ...(images && {
          images,
          cover: images![0],
        }),
        ...(tags && {
          tags: {
            connectOrCreate: tags.map(tag => ({
              where: {
                name: tag,
              },
              create: {
                name: tag,
                type: 'topic',
              },
            })),
          },
        }),
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
