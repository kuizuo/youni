export type TagItem = Awaited<
  ReturnType<import('./tag.service').TagService['findOne']>
>

export type TagList = Awaited<
  ReturnType<import('./note.service').TagService['paginate']>
>
