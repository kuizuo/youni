export type NoteItem = Awaited<
  ReturnType<import('./note.public.service').NotePublicService['getNoteById']>
>

export type NoteList = Awaited<
  ReturnType<import('./note.service').NoteService['paginate']>
>
