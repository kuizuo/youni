import { UserDto } from '~/modules/user/dto/user.dto'
import { snowflake } from '~/shared/database/snowflake.util'

export function generateMockUser(): UserDto {
  return {
    username: `mockUser_${snowflake.nextId()}`,
    nickname: `Mock User${snowflake.nextId()}`,
    avatar: 'https://example.com/avatar.jpg',
    password: 'mockPassword123',
    email: `mockuser_${snowflake.nextId()}@example.com`,
    provider: 'Github',
  }
}
