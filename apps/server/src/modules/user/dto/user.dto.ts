import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { isEmpty } from 'lodash'

import { PagerDto } from '~/common/dto/pager.dto'

export class UserDto {
  @ApiProperty({ description: '登录账号' })
  @IsString()
  @Matches(/^[a-z0-9A-Z\W_]+$/)
  @MinLength(4)
  @MaxLength(20)
  username: string

  @ApiProperty({ description: '登录密码' })
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

  @ApiProperty({ description: '归属角色', type: [Number] })
  @ArrayNotEmpty()
  roleIds: number[]

  @ApiProperty({ description: '归属大区', type: Number })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  deptId?: number

  @ApiProperty({ description: '呢称' })
  @IsOptional()
  @IsString()
  nickname: string

  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @ValidateIf(o => !isEmpty(o.email))
  email: string

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ description: '第三方平台' })
  @IsOptional()
  @IsString()
  provider?: string

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ description: '状态' })
  @IsIn([0, 1])
  @IsOptional()
  status?: number
}

export class UserUpdateDto extends PartialType(UserDto) {}

export class UserQueryDto extends IntersectionType(PagerDto<UserDto>, PartialType(UserDto)) {
  @ApiProperty({ description: '归属大区', example: 1 })
  @IsInt()
  @IsOptional()
  deptId: number

  @ApiProperty({ description: '状态', example: 0 })
  @IsInt()
  @IsOptional()
  status: number
}
