import { Prisma } from '@youni/database'

export const UserSelect = {
  id: true,
  nickname: true,
  avatar: true,
  desc: true,
} satisfies Prisma.UserSelect
