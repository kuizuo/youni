export type NoteItem = Awaited<
  ReturnType<import('./note.public.service').NotePublicService['getNoteById']>
>

export type NoteList = Awaited<
  ReturnType<import('./note.service').NoteService['paginate']>
>

export type InteractedNoteItem = NoteItem & {
  interactInfo: {
    liked: boolean
    likedCount: number
    collected: boolean
    collectedCount: number
    // commentCount: number
  }
}
