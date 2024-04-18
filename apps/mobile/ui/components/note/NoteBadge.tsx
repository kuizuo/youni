import { Badge, BadgeText } from '@gluestack-ui/themed'

import type { NoteState } from '@youni/database'

const stateMap: Record<NoteState, { text: string, action: 'info' | 'error' | 'muted' | 'warning' | 'success' | undefined }> = {
  Published: {
    text: '已发布',
    action: 'success',
  },
  Draft: {
    text: '草稿',
    action: 'muted',
  },
  Rejected: {
    text: '审核失败',
    action: 'error',
  },
  Audit: {
    text: '审核中',
    action: 'info',
  },
}

export function NoteBadge({ state }: { state: NoteState }) {
  return (
    <Badge size="md" variant="solid" borderRadius="$none" action={stateMap[state].action}>
      <BadgeText>{stateMap[state].text ?? '未知'}</BadgeText>
    </Badge>
  )
}
