import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { PagerDto } from '@server/common/dto/pager.dto'
import { CacheService } from '@server/shared/cache/cache.service'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { getRedisKey } from '@server/utils/redis.util'

import { UserPublicService } from '../user/user.public.service'

import { InteractState } from './interact'
import { InteractPagerDto } from './interact.dto'
import { CountingService } from './services/counting.service'
import { FollowService } from './services/follow.service'

@TRPCRouter()
@Injectable()
export class InteractTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly followSerive: FollowService,
    private readonly userService: UserPublicService,
    private readonly countingService: CountingService,
    private readonly cacheService: CacheService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('interact', {
      follow: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.followSerive.follow(id, user.id)
        }),
      unfollow: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.followSerive.unfollow(id, user.id)
        }),
      isFollowing: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return await this.followSerive.isUserFollowing(id, user.id)
        }),
      following: procedureAuth
        .input(InteractPagerDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id, cursor, limit } = input

          const { ids, meta } = await this.followSerive.getFollowingIds(id, { cursor, limit } as PagerDto)
          const commomIds = await this.followSerive.getCommonFollowingIds(id, user.id)

          const users = await this.userService.getUserByIds(ids)

          const items = users.map((user) => {
            return {
              ...user,
              isFollowing: commomIds.includes(user.id),
            }
          })

          return {
            items,
            meta,
          }
        }),
      followers: procedureAuth
        .input(InteractPagerDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id, cursor, limit } = input

          const { ids, meta } = await this.followSerive.getFollowerIds(id, { cursor, limit } as PagerDto)
          const commomIds = await this.followSerive.getCommonFollowerIds(id, user.id)

          const users = await this.userService.getUserByIds(ids)

          const items = users.map((user) => {
            return {
              ...user,
              isFollowing: commomIds.includes(user.id),
            }
          })

          return {
            items,
            meta,
          }
        }),
      state: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          const key = getRedisKey(`u:${id}:interact_state`)
          const cache = await this.cacheService.get<InteractState>(key)
          if (cache)
            return cache

          const isFollowing = await this.followSerive.isUserFollowing(id, user.id)
          const followingCount = await this.followSerive.getFollowingCount(id)
          const followerCount = await this.followSerive.getFollowerCount(id)

          const likesCount = await this.countingService.getUserLikedCount(id)

          const result: InteractState = {
            followingCount,
            followerCount,
            likesCount,
            isFollowing,
          }

          // await this.cacheService.set(key, result, 5 * 1000)
          return result
        }),
    })
  }
}
