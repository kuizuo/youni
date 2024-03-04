import { ApiProperty } from '@nestjs/swagger'

export class InteractInfo {
  @ApiProperty({ description: '是否点赞' })
  liked?: boolean

  @ApiProperty({ description: '点赞数' })
  likedCount?: number

  @ApiProperty({ description: '是否收藏' })
  collected?: boolean
  
  @ApiProperty({ description: '收藏数' })
  collectedCount?: number

  @ApiProperty({ description: '评论数' })
  commentCount?: number

  @ApiProperty({ description: '浏览数' })
  viewCount?: number
}
