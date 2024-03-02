export type NoteItem = Awaited<
  ReturnType<import('./note.service').NoteService['findOne']>
>

export type NoteList = Awaited<
  ReturnType<import('./note.service').NoteService['paginate']>
>
