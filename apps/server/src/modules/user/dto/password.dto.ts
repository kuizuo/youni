import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class PasswordUpdateDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @Matches(/^[a-z0-9A-Z\W_]+$/)
  @MinLength(6)
  oldPassword: string

  @ApiProperty({ description: '新密码' })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    { message: '密码必须包含大小写字母和数字，且长度不能小于6位' },
  )
  newPassword: string
}

export class UserPasswordDto {
  @ApiProperty({ description: '管理员/用户ID' })
  @IsInt()
  id: number

  @ApiProperty({ description: '更改后的密码' })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    { message: '密码必须包含大小写字母和数字，且长度不能小于6位' },
  )
  password: string
}

export class UserExistDto {
  @ApiProperty({ description: '登录账号' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{4,16}$/)
  @MinLength(6)
  @MaxLength(20)
  username: string
}
