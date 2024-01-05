import { ApiProperty } from '@nestjs/swagger'

import { IsString, IsStrongPassword, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: '手机号/邮箱' })
  @IsString()
  @MinLength(4)
  username: string

  @ApiProperty({ description: '密码', example: 'a123456' })
  @IsString()
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

export class RegisterDto {
  @ApiProperty({ description: '账号' })
  @IsString()
  username: string

  @ApiProperty({ description: '密码' })
  @IsString()
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
