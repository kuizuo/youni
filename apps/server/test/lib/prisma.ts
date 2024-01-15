import { getExtendedPrismaClient } from '@/shared/database/prisma.extension'

export const prisma = getExtendedPrismaClient({
  url: process.env.DATABASE_URL,
})
