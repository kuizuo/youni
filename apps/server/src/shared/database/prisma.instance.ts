import { Prisma, PrismaClient } from '@youni/prisma'

export function createExtendedPrismaClient({ url }: { url?: string } = {}) {
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
  })
  // .$extends(pagination())

  return extendedPrismaClient
}
export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>

export type AllModelNames = Prisma.TypeMap['meta']['modelProps']

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
