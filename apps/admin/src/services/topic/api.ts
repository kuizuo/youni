import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { NoteTagDto, NoteTagUpdateDto } from '@server/modules/note-tag/note-tag.dto';

export async function queryTopic(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.TopicList>>('/api/note-tags/page', {
    method: 'GET',
    params: {
      // ...params,
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

export async function addTopic(data: NoteTagDto) {
  return request<IBaseResponse<API.TopicItem>>(`/api/note-tags`, {
    method: 'POST',
    data,
  });
}

export async function updateTopic(id: string, data: NoteTagUpdateDto) {
  return request<IBaseResponse<API.TopicItem>>(`/api/note-tags/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeTopic(ids: string[]) {
  return request('/api/note-tags', {
    method: 'DELETE',
    data: { ids },
  });
}
