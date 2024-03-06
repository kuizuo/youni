export type NoteItem = Awaited<
  ReturnType<import('./note.public.service').NotePublicService['getNoteById']>
>

export type NoteList = Awaited<
  ReturnType<import('./note.service').NoteService['paginate']>
>

export type InteractedNote = NoteItem & {
  interactInfo: {
    liked: boolean
    likeCount: number
    collected: boolean
    collectedCount: number
    commentCount: number
  }
}
