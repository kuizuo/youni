import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { Role, User } from '@youni/database'
import Redis from 'ioredis'

import { FollowService } from '../interact/services/follow.service'

import { NotePublicService } from '../note/note.public.service'

import { UserSearchDto } from './dto/search.dto'
import { UserSelect } from './user.constant'

@Injectable()
export class UserPublicService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
    private readonly noteService: NotePublicService,
    private readonly followService: FollowService,
  ) { }

  async getUserById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        ...UserSelect,
        gender: true,
        yoId: true,
        campus: {
          select: {
            id: true,
            logo: true,
            name: true,
          },
        },
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.UserNotFound),
    ))
  }

  async getUserByIds(ids: string[]) {
    return await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        ...UserSelect,
      },
    })
  }

  async search(dto: UserSearchDto) {
    const { keyword, cursor, limit, sortBy = 'createdAt', sortOrder = 'desc' } = dto

    const [items, meta] = await this.prisma.user.paginate({
      where: {
        nickname: { contains: keyword },
        role: Role.User,
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

  async appendInteractInfo(items: User | User[], userId: string) {
    if (!Array.isArray(items))
      items = [items]

    const followerCounts = await Promise.all(items.map(item => this.followService.getFollowerCount(item.id)))
    const noteCounts = await Promise.all(items.map(item => this.noteService.getCountByUserId(item.id)))
    const isFollowings = await Promise.all(items.map(item => this.followService.isUserFollowing(item.id, userId)))

    items.forEach((item, index) => {
      (item as any).interact = {
        followerCount: followerCounts[index],
        noteCount: noteCounts[index],
        isFollowing: isFollowings[index],
      }
    })
  }
}
