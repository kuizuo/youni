import { Prisma } from '@youni/database'

export const UserSelect = {
  id: true,
  nickname: true,
  avatar: true,
  desc: true,
} satisfies Prisma.UserSelect

export const UserProfileSelect = {
  id: true,
  nickname: true,
  avatar: true,
  desc: true,
  email: true,
  gender: true,
  yoId: true,
  campusId: true,
  role: true,
}
