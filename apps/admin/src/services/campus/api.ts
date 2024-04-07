import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { NoteDto, NoteUpdateDto } from '@server/modules/note/note.dto';

export async function queryNote(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.NoteList>>('/api/notes/page', {
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

export async function addNote(data: NoteDto) {
  return request<IBaseResponse<API.NoteItem>>(`/api/notes`, {
    method: 'POST',
    data,
  });
}

export async function updateNote(id: string, data: NoteUpdateDto) {
  return request<IBaseResponse<API.NoteItem>>(`/api/notes/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeNote(ids: string[]) {
  return request('/api/notes', {
    method: 'DELETE',
    data: { ids },
  });
}
