import { AuthModule } from '@server/modules/auth/auth.module'
import { AuthService } from '@server/modules/auth/auth.service'
import { TodoModule } from '@server/modules/todo/todo.module'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { prisma } from '@test/lib/prisma'
import { mockUserData1 } from '@test/mock/data/user.data'
import { Todo, User } from '@youni/prisma'

describe('Todo', () => {
  const proxy = createE2EApp({
    imports: [TodoModule, AuthModule],

  })

  let authService: AuthService

  let user: User
  let todo: Todo

  beforeAll(async () => {
    user = await prisma.user.create({
      data: mockUserData1,
    })

    todo = await prisma.todo.create({
      data: {
        value: 'code',
        status: false,
        userId: user.id,
      },
    })
  })

  beforeEach(() => {
    authService = proxy.app.get(AuthService)
  })

  it('GET /todos/:id successful', async () => {
    const token = await authService.sign(user.id, user.role)

    const response = await proxy.app.inject({
      method: 'GET',
      url: `/todos/${todo.id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toEqual(200)
  })

  it('GET /todos/:id cannot find by other', async () => {
    const token = await authService.sign('other', 'User')

    const response = await proxy.app.inject({
      method: 'GET',
      url: `/todos/${todo.id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    expect(response.statusCode).toEqual(403)
  })
})
