import { DatabaseConfig } from '~/config/database.config'

import { createExtendedPrismaClient } from './prisma.instance'

export const PRISMA_CLIENT = 'PRISMA_CLIENT'

export const extendedPrismaClient = createExtendedPrismaClient({ url: DatabaseConfig().url })

export type ExtendedPrismaClient = typeof extendedPrismaClient
