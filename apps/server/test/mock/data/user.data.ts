import { Role } from '~/modules/auth/auth.constant'
import { UserDto } from '~/modules/user/dto/user.dto'
import { snowflake } from '~/shared/database/snowflake.util'
import { randomValue } from '~/utils/tool.util'

export function generateMockUser(): UserDto {
  return {
    username: `mockUser_${snowflake.nextId()}`,
    nickname: `Mock User${snowflake.nextId()}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${randomValue(5)}`,
    password: 'mockPassword123',
    email: `mockuser_${snowflake.nextId()}@example.com`,
    provider: 'Github',
    role: Role.User,
  }
}

const mockUserData1 = generateMockUser()

export { mockUserData1 }
