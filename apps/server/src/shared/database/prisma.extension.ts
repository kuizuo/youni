import { Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClient, Prisma as _Prisma } from '@youni/prisma'
import { pagination } from 'prisma-extension-pagination'

import { DEFAULT_LIMIT } from '~/common/dto/pager.dto'

import { DatabaseConfig } from '~/config/database.config'

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT')

export function InjectPrismaClient() {
  return Inject(PRISMA_CLIENT)
}

export function getExtendedClient({ url }: { url?: string }) {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })

  const extendedPrismaClient = prismaClient.$extends({
    result: {},
    model: {
      $allModels: {
        async exists<T, A>(
          this: T,
          args: Prisma.Exact<
            A,
            Pick<Prisma.Args<T, 'findFirst'>, 'where'>
          >,
        ): Promise<boolean> {
          if (typeof args !== 'object')
            return false

          if (!('where' in args))
            return false

          const count = await (this as any).count({ where: args.where })

          return count > 0
        },
      },
    },
  }).$extends(pagination({
    cursor: {
      limit: DEFAULT_LIMIT,
    },
    pages: {
      limit: DEFAULT_LIMIT,
    },
  }))

  return extendedPrismaClient
}

export type ExtendedPrismaClient = ReturnType<typeof getExtendedClient>

export const extendedPrismaClient = getExtendedClient({ url: DatabaseConfig().url })

export type AllModelNames = _Prisma.TypeMap['meta']['modelProps']

export type ModelFindInput<T extends AllModelNames> = NonNullable<
  Parameters<ExtendedPrismaClient[T]['findFirst']>[0]
>

export type ModelCreateInput<T extends AllModelNames> = NonNullable<
  Parameters<ExtendedPrismaClient[T]['create']>[0]
>

export type ModelInputWhere<T extends AllModelNames> =
  ModelFindInput<T>['where']

export type ModelInputData<T extends AllModelNames> =
  ModelCreateInput<T>['data']
