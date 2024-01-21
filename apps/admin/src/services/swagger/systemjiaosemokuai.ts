// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/system/roles */
export async function roleControllerList(options?: { [key: string]: any }) {
  return request<any>('/api/system/roles', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/system/roles */
export async function roleControllerCreate(body: API.RoleDto, options?: { [key: string]: any }) {
  return request<any>('/api/system/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/system/roles/${param0} */
export async function roleControllerGetRoleById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerGetRoleByIdParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/roles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /api/system/roles/${param0} */
export async function roleControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerUpdateParams,
  body: API.RoleUpdateDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/roles/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/system/roles/${param0} */
export async function roleControllerDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerDeleteParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system/roles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
