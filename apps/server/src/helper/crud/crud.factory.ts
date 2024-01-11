import type { Type } from '@nestjs/common'

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import pluralize from 'pluralize'

import { z } from 'zod'

import { IdDto } from '~/common/dto/id.dto'
import { PagerDto } from '~/common/dto/pager.dto'
import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { AllModelNames, ExtendedPrismaClient, InjectPrismaClient } from '~/shared/database/prisma.extension'
import { resourceNotFoundWrapper } from '~/utils/prisma.util'

export function BaseCrudFactory<
  M extends AllModelNames,
  CDto extends z.AnyZodObject = z.AnyZodObject,
  UDto extends z.AnyZodObject = z.AnyZodObject,
>({ modelName, createSchema, updateSchema, apiPrefix }: {
  modelName: M
  createSchema: CDto
  updateSchema?: UDto
  apiPrefix?: string
}): Type<any> {
  const prefix = modelName.toLowerCase()
  const pluralizeName = pluralize(prefix) as string

  class UpdateDto extends createZodDto(updateSchema || createSchema.partial()) {}

  class CreateDto extends createZodDto(createSchema) {}

  @Controller(apiPrefix || pluralizeName)
  class BaseController {
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient

    private get db() {
      return this.prisma[modelName]
    }

    @Get()
    async list(@Query() pager: PagerDto) {
      const { page, limit } = pager
      return await this.db.paginate().withPages({
        page,
        limit,
      })
    }

    @Get('all')
    async getAll() {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.findMany()
    }

    @Get(':id')
    async get(@Param() { id }: IdDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.findUniqueOrThrow({
        where: {
          id,
        },
      })
        .catch(
          resourceNotFoundWrapper(
            new BizException(ErrorEnum.RESOURCE_NOT_FOUND),
          ),
        )
    }

    @Post()
    async create(@Body() body: CreateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.create({
        data: body,
      })
    }

    @Put(':id')
    async update(@Param() { id }: IdDto, @Body() body: UpdateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.update({
        where: { id },
        data: body,
      })
    }

    @Patch(':id')
    async patch(@Param() { id }: IdDto, @Body() body: UpdateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      await this.db.update({
        where: { id },
        data: {
          ...body,
        },
      })
    }

    @Delete(':id')
    async delete(@Param() { id }: IdDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      await this.db.delete({ where: { id } })
    }
  }

  return BaseController
}
