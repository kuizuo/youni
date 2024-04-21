import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { TagDto, TagUpdateDto } from '@server/modules/tag/tag.dto';

export async function queryTopic(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.TopicList>>('/api/tags/page', {
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

export async function addTopic(data: TagDto) {
  return request<IBaseResponse<API.TopicItem>>(`/api/tags`, {
    method: 'POST',
    data,
  });
}

export async function updateTopic(id: string, data: TagUpdateDto) {
  return request<IBaseResponse<API.TopicItem>>(`/api/tags/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeTopic(ids: string[]) {
  return request('/api/tags', {
    method: 'DELETE',
    data: { ids },
  });
}
