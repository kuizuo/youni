import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@youni/prisma'
import { compareSync } from 'bcrypt'

import Redis from 'ioredis'
import { isEmpty, isNil } from 'lodash'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'
import { UserService } from '~/modules/user/user.service'

// import { LoginLogService } from '../system/log/services/login-log.service'

import { randomValue, sleep } from '~/utils/tool.util'

import { MenuService } from '../system/menu/menu.service'
import { RoleService } from '../system/role/role.service'

import { TokenService } from './services/token.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
    private readonly roleService: RoleService,
    // private readonly loginLogService: LoginLogService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(credential: string, password: string) {
    const user = await this.userService.findUserByUsername(credential)

    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)

    const isSamePassword = compareSync(password, user.password)

    if (!isSamePassword) {
      await sleep(2000)
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD)
    }

    if (user) {
      const { password, ...result } = user
      return result
    }

    return null
  }

  /**
   * 获取登录JWT
   * 返回null则账号密码有误，不存在该用户
   */
  async login(
    username: string,
    password: string,
    ip: string,
    ua: string,
  ): Promise<string> {
    const user = await this.userService.findUserByUsername(username)
    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD)

    const isSamePassword = compareSync(password, user.password)

    if (!isSamePassword) {
      await sleep(2000)
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD)
    }

    const roles = await this.roleService.getRolesByUserId(user.id)

    // 包含access_token和refresh_token
    const token = await this.tokenService.generateAccessToken(user.id, roles.map(r => r.value))

    await this.redis.set(`auth:token:${user.id}`, token.accessToken)

    // 设置密码版本号 当密码修改时，版本号+1
    await this.redis.set(`auth:passwordVersion:${user.id}`, 1)

    // 设置菜单权限
    const permissions = await this.menuService.getPermissions(user.id)
    await this.setPermissionsCache(user.id, permissions)

    // await this.loginLogService.create(user.id, ip, ua)

    return token.accessToken
  }

  async loginByGoogle(info: Prisma.UserCreateInput) {
    const exist = await this.userService.findUserByEmail(info.email!)
    const role = await this.roleService.getDefaultRole()

    const user = isNil(exist)
      ? await this.userService.create({
        username: info.email!,
        email: info.email!,
        nickname: info.nickname!,
        avatar: info.avatar!,
        password: randomValue(10),
        provider: 'Google',
        roleIds: [role!.id],
      })
      : exist

    return user
  }

  async loginLog(uid: string, ip: string, ua: string) {
    // await this.loginLogService.create(uid, ip, ua)
  }

  async logout(uid: string) {
    // 删除token
    await this.userService.forbidden(uid)
  }

  /**
   * 重置密码
   */
  async resetPassword(username: string, password: string) {
    const user = await this.userService.findUserByUsername(username)

    await this.userService.forceUpdatePassword(user.id, password)
  }

  /**
   * 清除登录状态信息
   */
  async clearLoginStatus(uid: string): Promise<void> {
    await this.userService.forbidden(uid)
  }

  /**
   * 获取菜单列表
   */
  async getMenus(uid: string) {
    // return this.menuService.getMenus(uid)
  }

  /**
   * 获取权限列表
   */
  async getPermissions(uid: string) {
    const permissions = await this.menuService.getPermissions(uid)

    await this.setPermissionsCache(uid, permissions)

    return permissions
  }

  async getPermissionsCache(uid: string) {
    const permissionString = await this.redis.get(`auth:permission:${uid}`)
    return permissionString ? JSON.parse(permissionString) : []
  }

  async setPermissionsCache(uid: string, permissions: string[]): Promise<void> {
    await this.redis.set(`auth:permission:${uid}`, JSON.stringify(permissions))
  }

  async getPasswordVersionByUid(uid: string) {
    return this.redis.get(`auth:passwordVersion:${uid}`)
  }

  async getTokenByUid(uid: string) {
    return this.redis.get(`auth:token:${uid}`)
  }
}
