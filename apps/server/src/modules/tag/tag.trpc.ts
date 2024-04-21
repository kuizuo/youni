import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { TagInputSchema, TagPagerDto, TagSearchDto } from './tag.dto'
import { TagService } from './tag.service'

@TRPCRouter()
@Injectable()
export class TagTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly tagService: TagService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('tag', {
      list: procedureAuth
        .input(TagPagerDto.schema)
        .meta({ model: 'Tag', action: Action.Manage })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.tagService.paginate(input, user.id)
        }),
      search: procedureAuth
        .input(TagSearchDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.tagService.search(input, user.id)
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.tagService.findOne(id, user.id)
        }),
      byName: procedureAuth
        .input(z.object({
          name: z.string(),
        }))
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { name } = input

          return this.tagService.findOneByName(name, user.id)
        }),
      create: procedureAuth
        .input(TagInputSchema)
        .meta({ model: 'Tag', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.tagService.create(input)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Tag', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.tagService.delete(id)
        }),
    })
  }
}
