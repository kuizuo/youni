import { NoteState, Prisma } from '@youni/database'

export enum NoteType {
  Follow = 'follow', // 关注
  Recommend = 'recommend', // 推荐
  Video = 'Video', // 视频
  Activity = 'activity', // 活动
  News = 'news', // 新闻
}

export const PublicNoteWhere = {
  state: NoteState.Published,
  campusId: null,
} satisfies Prisma.NoteWhereInput

export const NoteSelect = {
  id: true,
  title: true,
  content: true,
  images: true,
  cover: true,
  tags: {
    select: {
      name: true,
      type: true,
    },
  },
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
  state: true,
} satisfies Prisma.NoteSelect

export enum NoteEvents {
  NoteLike = 'note.like',
  NoteDislike = 'note.dislike',
  NoteCollect = 'note.collect',
  NoteUncollect = 'note.uncollect',
}
