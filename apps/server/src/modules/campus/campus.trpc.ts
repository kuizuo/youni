import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { CampusInputSchema, CampusPagerDto, CampusSearchDto } from './campus.dto'
import { CampusService } from './campus.service'

@TRPCRouter()
@Injectable()
export class CampusTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly campusService: CampusService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('campus', {
      list: procedureAuth
        .input(CampusPagerDto.schema)
        .meta({ model: 'Campus', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.campusService.paginate(input)
        }),
      search: procedureAuth
        .input(CampusSearchDto.schema)
        .meta({ model: 'Campus', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.campusService.search(input)
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Campus', action: Action.Read })
        .query(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.campusService.findOne(id)
        }),
      create: procedureAuth
        .input(CampusInputSchema)
        .meta({ model: 'Campus', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.campusService.create(input)
        }),
      update: procedureAuth
        .input(CampusInputSchema.extend({ id: z.string() }))
        .meta({ model: 'Campus', action: Action.Update })
        .mutation(async (opt) => {
          const { input } = opt
          const { id, ...data } = input

          return this.campusService.update(id, data)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Campus', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.campusService.delete(id)
        }),
    })
  }
}
