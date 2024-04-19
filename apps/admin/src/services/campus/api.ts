import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { CampusDto, CampusUpdateDto } from '@server/modules/campus/campus.dto';

export async function queryCampus(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.CampusList>>('/api/campus/page', {
    method: 'GET',
    params: {
      ...params,
      page: params.current,
      limit: params.pageSize
    },
    ...(options || {}),
  });

  return {
    success: result.ok,
    data: result.data?.items,
    total: result.data?.meta.totalCount,
  }
}

export async function addCampus(data: CampusDto) {
  return request<IBaseResponse<API.CampusItem>>(`/api/campus`, {
    method: 'POST',
    data,
  });
}

export async function updateCampus(id: string, data: CampusUpdateDto) {
  return request<IBaseResponse<API.CampusItem>>(`/api/campus/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeCampus(ids: string[]) {
  return request('/api/campus', {
    method: 'DELETE',
    data: { ids },
  });
}
