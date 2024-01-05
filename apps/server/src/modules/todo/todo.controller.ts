// FIXME:
// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { Body, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '~/common/dto/delete.dto'

import { Perm, PermissionMap } from '../auth/decorators/permission.decorator'

import { Public } from '../auth/decorators/public.decorator'

import { ResourceGuard } from '../auth/guards/resource.guard'

import { TodoService } from './todo.service'

const permissions: PermissionMap<'todo'> = {
  LIST: `todo:list`,
  CREATE: `todo:create`,
  READ: `todo:read`,
  UPDATE: `todo:update`,
  DELETE: `todo:delete`,
} as const

@ApiTags('Business - Todo模块')
@UseGuards(ResourceGuard)
@Public()
export class TodoController {
  constructor(private readonly todoService: TodoService) {
  }

  @Post('batchDelete')
  @Perm(permissions.DELETE)
  async batchDelete(@Body() dto: BatchDeleteDto): Promise<void> {
    await this.todoService.batchDelete(dto.ids)
  }
}
