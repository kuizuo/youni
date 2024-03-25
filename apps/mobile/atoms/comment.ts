import { atom, useAtom } from 'jotai'
import { CommentItem } from '@server/modules/comment/comment'
import { NoteItem } from '@server/modules/note/note'

const commentModalOpenAtom = atom(false)

export function useCommentModalOpen() {
  return [...useAtom(commentModalOpenAtom)] as const
}

const parentCommentAtom = atom<CommentItem>({} as CommentItem)

export function useParentComment() {
  return [...useAtom(parentCommentAtom)] as const
}

const currentNote = atom<NoteItem>({} as NoteItem)

export function useCurrentNote() {
  return [...useAtom(currentNote)] as const
}

export const newCommentsAtom = atom<CommentItem[]>([] as CommentItem[])
