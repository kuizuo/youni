import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { NoteTagInputSchema, NoteTagPagerDto, NoteTagSearchDto } from './note-tag.dto'
import { NoteTagService } from './note-tag.service'

@TRPCRouter()
@Injectable()
export class NoteTagTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly noteTagService: NoteTagService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('noteTag', {
      list: procedureAuth
        .input(NoteTagPagerDto.schema)
        .meta({ model: 'NoteTag', action: Action.Manage })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteTagService.paginate(input, user.id)
        }),
      search: procedureAuth
        .input(NoteTagSearchDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteTagService.search(input, user.id)
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.noteTagService.findOneById(id, user.id)
        }),
      byName: procedureAuth
        .input(z.object({
          name: z.string(),
        }))
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { name } = input

          return this.noteTagService.findOneByName(name, user.id)
        }),
      create: procedureAuth
        .input(NoteTagInputSchema)
        .meta({ model: 'NoteTag', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteTagService.create(input)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'NoteTag', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.noteTagService.delete(id)
        }),
    })
  }
}
