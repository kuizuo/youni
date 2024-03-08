import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { CollectionCursorDto, CollectionInputSchema, CollectionItemDto } from './collection.dto'
import { CollectionService } from './collection.service'

@TRPCRouter()
@Injectable()
export class CollectionTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly collectionService: CollectionService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('collection', {
      list: procedureAuth
        .input(CollectionCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.collectionService.paginate(input, user.id)
        }),
      create: procedureAuth
        .input(CollectionInputSchema)
        .meta({ model: 'Collection', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.collectionService.create(input, user.id)
        }),
      update: procedureAuth
        .input(CollectionInputSchema.extend({ id: z.string() }))
        .meta({ model: 'Collection', action: Action.Update })
        .mutation(async (opt) => {
          const { input } = opt
          const { id, ...data } = input

          return this.collectionService.update(id, data)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Collection', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.collectionService.delete(id)
        }),
      defaultCollection: procedureAuth
        .query(async (opt) => {
          const { ctx: { user } } = opt

          return this.collectionService.getDefaultCollection(user.id)
        }),
      addItem: procedureAuth
        .input(CollectionItemDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { itemId } = input

          return this.collectionService.addItem(itemId, user.id)
        }),
      deleteItem: procedureAuth
        .input(CollectionItemDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { itemId } = input

          return this.collectionService.deleteItem(itemId, user.id)
        }),
    })
  }
}
