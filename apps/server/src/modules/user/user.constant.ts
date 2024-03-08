import { Prisma } from '@youni/database'

export const UserSelect: Prisma.UserSelect = {
  id: true,
  nickname: true,
  avatar: true,
  desc: true,
}
