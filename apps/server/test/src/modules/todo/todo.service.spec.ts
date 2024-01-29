import { createServiceUnitTestApp } from '@test/helper/create-service-unit'
import { prisma } from '@test/lib/prisma'
import { mockUserData1 } from '@test/mock/data/user.data'
import { Todo, User } from '@youni/prisma'

import { TodoService } from '~/modules/todo/todo.service'

import { DatabaseModule } from '~/shared/database/database.module'

describe('todoService', () => {
  const proxy = createServiceUnitTestApp(TodoService, {
    imports: [DatabaseModule],
  })

  let user: User
  let todo: Todo

  beforeAll(async () => {
    user = await prisma.user.create({
      data: mockUserData1,
    })
  })

  it('query todo', async () => {
    const result = await proxy.service.paginate({ page: 1, limit: 10 }, user.id)
    expect(result).toMatchInlineSnapshot(`
      {
        "items": [],
        "meta": {
          "currentPage": 1,
          "isFirstPage": true,
          "isLastPage": true,
          "nextPage": null,
          "pageCount": 0,
          "previousPage": null,
          "totalCount": 0,
        },
      }
    `)
  })

  it('create todo', async () => {
    todo = await proxy.service.create({ value: 'code' }, user.id)
    expect(todo.value).toEqual('code')
    expect(todo.userId).toEqual(user.id)
  })

  it('get todo by id successful', async () => {
    const result = await proxy.service.findOne(todo.id, user.id)
    expect(result).toBeDefined()
  })

  it('get todo throw when 404', async () => {
    expect(proxy.service.findOne('not-found')).rejects.toThrowError()
  })

  it('update todo', async () => {
    const result = await proxy.service.update(todo.id, { status: 1 }, user.id)

    expect(result.status).toEqual(1)
  })

  it('delete todo', async () => {
    await proxy.service.delete(todo.id, user.id)

    expect(proxy.service.findOne(todo.id)).rejects.toThrowErrorMatchingInlineSnapshot(`[NotFoundError: No Todo found]`)
  })
})
