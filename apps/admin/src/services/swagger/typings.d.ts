declare namespace API {
  type LoginDto = {
    username: string;
    password: string;
    type: 'account' | 'email' | 'mobile';
  };

  type PasswordUpdateDto = {
    oldPassword: string;
    newPassword: string;
  };

  type RegisterDto = {
    username: string;
    password: string;
    type: 'account' | 'email' | 'mobile';
  };

  type ResOp = {
    ok: boolean;
    code: number;
    msg: string;
    data: Record<string, any>;
  };

  type RoleDto = {
    id?: string;
    name: string;
    value: string;
    remark: string;
    default?: boolean;
    status?: number;
    createdAt?: any;
    updatedAt?: any;
    menuIds?: string[];
  };

  type RoleUpdateDto = {
    id?: string;
    name?: string;
    value?: string;
    remark?: string;
    default?: boolean;
    status?: number;
    createdAt?: any;
    updatedAt?: any;
    menuIds?: string[];
  };

  type SendEmailCodeDto = {
    email: string;
  };

  type UpdateProfileDto = {
    nickname?: string;
    avatar?: string;
    phone?: string;
  };

  type UserDto = {
    provider: 'Google' | 'Github';
    id?: string;
    username: string;
    password: string;
    avatar: string;
    email: string;
    phone?: string;
    status?: number;
    createdAt?: any;
    updatedAt?: any;
    nickname: string;
    remark?: string;
    roleIds?: string[];
  };

  type UserPasswordDto = {
    id: string;
    password: string;
  };

  type UserUpdateDto = {
    provider?: 'Google' | 'Github';
    id?: string;
    username?: string;
    password?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    status?: number;
    createdAt?: any;
    updatedAt?: any;
    nickname?: string;
    remark?: string;
    roleIds?: string[];
  };
}
