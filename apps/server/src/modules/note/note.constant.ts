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
  imageList: true,
  tags: true,
  user: true,
  publishTime: true,
} satisfies Prisma.NoteSelect
