import SkeletonContent from 'react-native-reanimated-skeleton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NoteItem } from '@server/modules/note/note'
import { Text } from 'react-native'
import { NoteHeader } from './NoteHeader'

export function NoteDetailPlaceholder({ isLoading, item }: {
  isLoading?: boolean
  item?: NoteItem
}) {
  const { top } = useSafeAreaInsets()
  return (
    <>
      <SkeletonContent
        isLoading={true}
        containerStyle={{ flex: 1, paddingTop: top, marginHorizontal: 12 }}
        animationType="pulse"
        duration={2000}
        layout={[
          {
            key: 'header',
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
            children: [
              { key: 'avatar', width: 40, height: 40, borderRadius: 99 },
              { key: 'name', width: 100, height: 30 },
              // { width: 40, height: 40 },
            ],
          },
          { key: 'image', width: '100%', height: 300, marginBottom: 12 },
          { key: 'content', width: '100%', gap: 12, marginBottom: 12, children: [
            { key: 'title', width: '70%', height: 30 },
            { key: 'content-content', width: '100%', height: 60 },
          ] },
          {
            key: 'comment1',
            gap: 12,
            marginBottom: 12,
            children: [
              {
                flexDirection: 'row',
                gap: 12,
                children: [
                  { key: 'comment-avatar', width: 40, height: 40 },
                  { key: 'comment-name', width: 80, height: 24 },
                ],
              },
              { key: 'comment-content', width: '80%', height: 40, marginLeft: 40 + 12 },
            ],
          },
          {
            key: 'comment2',
            gap: 12,
            children: [
              {
                flexDirection: 'row',
                gap: 12,
                children: [
                  { key: 'comment-avatar', width: 40, height: 40 },
                  { key: 'comment-name', width: 80, height: 24 },
                ],
              },
              { key: 'comment-content', width: '80%', height: 40, marginLeft: 40 + 12 },
            ],
          },
        ]}
      >

      </SkeletonContent>
    </>
  )
}
