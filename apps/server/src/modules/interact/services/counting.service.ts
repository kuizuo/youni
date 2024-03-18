import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { CommentRefType } from '@youni/database'

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

  async getItemCollectCount(itemId: string) {
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

  async getCommentCount(refType: InteractType, refId: string, parentId?: string) {
    return await this.prisma.comment.count({
      where: {
        refId,
        refType: refType as CommentRefType,
        ...(parentId && { parentId }),
      },
    })
  }

  async updateCount(
    type: InteractType,
    itemId: string,
    countType: 'liked' | 'collect' | 'comment',
    count: number,
  ) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
       SET interact = jsonb_set(
         interact,
         '{"${countType}Count"}',
         to_jsonb(${count})
       )
       WHERE id = $1`,
      itemId,
    )
  }
}
