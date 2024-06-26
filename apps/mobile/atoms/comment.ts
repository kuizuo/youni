import { atom, useAtom } from 'jotai'
import type { CommentItem } from '@server/modules/comment/comment'
import type { NoteItem } from '@server/modules/note/note'

const commentBoxOpenAtom = atom(false)

export function useCommentBoxOpen() {
  return [...useAtom(commentBoxOpenAtom)] as const
}

const parentCommentAtom = atom<CommentItem>({} as CommentItem)

export function useParentComment() {
  return [...useAtom(parentCommentAtom)] as const
}

const currentNote = atom<NoteItem>({} as NoteItem)

export function useCurrentNote() {
  return [...useAtom(currentNote)] as const
}
