import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class UpdateProfileDto {
  @ApiProperty({ description: '用户呢称' })
  @IsString()
  @IsOptional()
  nickname: string

  @ApiProperty({ description: '用户邮箱' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '用户手机号' })
  @IsOptional()
  @IsString()
  phone: string

  @ApiProperty({ description: '用户头像' })
  @IsOptional()
  @IsString()
  avatar: string

  @ApiProperty({ description: '职业' })
  @IsOptional()
  @IsString()
  profession: string

  @ApiProperty({ description: '爱好' })
  @IsOptional()
  @IsString({ each: true })
  hobbies: string[]
}

export class ResetPasswordDto {
  @ApiProperty({ description: '临时token', example: 'uuid' })
  @IsString()
  accessToken: string

  @ApiProperty({ description: '密码', example: 'a123456' })
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
