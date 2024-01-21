// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户列表 GET /api/system/users */
export async function userControllerList(options?: { [key: string]: any }) {
  return request<any>('/api/system/users', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新增用户 POST /api/system/users */
export async function userControllerCreate(body: API.UserDto, options?: { [key: string]: any }) {
  return request<any>('/api/system/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询用户 GET /api/system/users/${param0} */
export async function userControllerGetUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerGetUserByIdParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/users/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新用户 PUT /api/system/users/${param0} */
export async function userControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerUpdateParams,
  body: API.UserUpdateDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/users/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 DELETE /api/system/users/${param0} */
export async function userControllerDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerDeleteParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/users/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更改用户密码 POST /api/system/users/${param0}/password */
export async function userControllerPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerPasswordParams,
  body: API.UserPasswordDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/users/${param0}/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
