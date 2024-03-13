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
  user: {
    select: {
      id: true,
      nickname: true,
      avatar: true,
    },
  },
  userId: true,
  publishTime: true,
} satisfies Prisma.NoteSelect

export enum NoteEvents {
  NoteLike = 'note.like',
  NoteDislike = 'note.dislike',
  NoteCollect = 'note.collect',
  NoteUncollect = 'note.uncollect',
}
