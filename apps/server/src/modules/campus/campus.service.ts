import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { CampusDto, CampusPagerDto, CampusSearchDto, CampusUpdateDto } from './campus.dto'

@Injectable()
export class CampusService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate(dto: CampusPagerDto) {
    const { page, limit, name } = dto
    const [items, meta] = await this.prisma.campus.paginate({
      where: {
        name: { contains: name },
      },
    }).withPages({ page, limit, includePageCount: true })

    return {
      items,
      meta,
    }
  }

  async search(dto: CampusSearchDto) {
    const { name } = dto
    const items = await this.prisma.campus.findMany({
      where: {
        name: { contains: name },
      },
      select: {
        id: true,
        name: true,
        logo: true,
      },
    })

    return items
  }

  async findOne(id: string) {
    return this.prisma.campus.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

  async create(dto: CampusDto) {
    const { ...data } = dto
    return this.prisma.campus.create({
      data: {
        ...data,
      },
    })
  }

  async update(id: string, dto: CampusUpdateDto) {
    return this.prisma.campus.update({
      where: { id },
      data: {
        ...dto,
      },
    })
  }

  async delete(id: string) {
    return this.prisma.campus.delete({
      where: {
        id,
      },
    })
  }

  async batchDelete(ids: string[]) {
    const items = await this.prisma.campus.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return items
  }

  async getCampusByUserId(userId: string) {
    const campus = await this.prisma.campus.findFirst({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
    })

    return campus
  }
}
