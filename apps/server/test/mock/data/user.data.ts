import { Role } from '@server/modules/auth/auth.constant'
import { UserDto } from '@server/modules/user/dto/user.dto'
import { snowflake } from '@server/shared/database/snowflake.util'

export function generateMockUser(): UserDto {
  const id = snowflake.nextId()
  return {
    username: `mockUser_${id}`,
    nickname: `Mock User${id}`,
    avatar: `https://picsum.photos/200/200`,
    password: 'mockPassword123',
    email: `mockuser_${id}@example.com`,
    role: Role.User,
    yoId: id.slice(0, 10),
  }
}

const mockUserData1 = generateMockUser()

export { mockUserData1 }
