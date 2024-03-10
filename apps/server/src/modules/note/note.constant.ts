import { Prisma } from '@youni/database'

export enum NoteType {
  Follow = 'follow', // 关注
  Recommend = 'recommend', // 推荐
  Video = 'Video', // 视频
  Activity = 'activity', // 活动
  News = 'news', // 新闻
}

export const NoteSelect = {
  id: true,
  title: true,
  content: true,
  images: true,
  cover: true,
  tags: true,
  interact: true,
  user: true,
  publishTime: true,
} satisfies Prisma.NoteSelect
