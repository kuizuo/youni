import { ApiProperty } from '@nestjs/swagger'

import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator'

export class EmailLoginDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '验证码' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  code: string
}

export class EmailRegisterDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '密码' })
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

  @ApiProperty({ description: '验证码' })
  @IsString()
  code: string
}
