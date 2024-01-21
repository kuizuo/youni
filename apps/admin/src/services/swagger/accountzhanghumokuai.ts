// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 账户登出 GET /api/account/logout */
export async function accountControllerLogout(options?: { [key: string]: any }) {
  return request<any>('/api/account/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取菜单列表 GET /api/account/menus */
export async function accountControllerMenu(options?: { [key: string]: any }) {
  return request<any>('/api/account/menus', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更改账户密码 POST /api/account/password */
export async function accountControllerPassword(
  body: API.PasswordUpdateDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/account/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取权限列表 GET /api/account/permissions */
export async function accountControllerPermissions(options?: { [key: string]: any }) {
  return request<any>('/api/account/permissions', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取账户资料 GET /api/account/profile */
export async function accountControllerProfile(options?: { [key: string]: any }) {
  return request<any>('/api/account/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更改账户资料 PUT /api/account/profile */
export async function accountControllerUpdateProfile(
  body: API.UpdateProfileDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/account/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
