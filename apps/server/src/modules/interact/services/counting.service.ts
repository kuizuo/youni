import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { InteractType } from '../interact.constant'

import { LikeService } from './like.service'

@Injectable()
export class CountingService {
  constructor(
    @InjectPrismaClient() private prisma: ExtendedPrismaClient,
    private likeService: LikeService,
  ) { }

  /**
   * 获取用户获赞数
   */
  async getUserLikedCount(userId: string) {
    const [{ sum }] = await this.prisma.$queryRawUnsafe<[{ sum: number }]>(`
      SELECT SUM((interact->>'likedCount')::int)
      FROM "${InteractType.Note}"
      WHERE "userId" = $1
    `, userId)

    return Number(sum) ?? 0
  }

  async updateLikeCount(
    type: InteractType,
    itemId: string,
  ) {
    const likeCount = await this.likeService.getItemlikedCount(type, itemId)

    await this.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
SET interact = jsonb_set(
interact,
  '{likedCount}',
  to_jsonb(${likeCount})
)
WHERE id = $1`,
      itemId,
    )
  }

  async updateCollectionCount(
    type: InteractType,
    itemId: string,
    count: number,
  ) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
SET interact = jsonb_set(
interact,
  '{collectedCount}',
  to_jsonb(${count})
)
WHERE id = $1`,
      itemId,
    )
  }

  async updateCommentCount(
    type: InteractType,
    itemId: string,
    count: number,
  ) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
SET interact = jsonb_set(
interact,
  '{commentCount}',
  to_jsonb(${count})
)
WHERE id = $1`,
      itemId,
    )
  }
}
