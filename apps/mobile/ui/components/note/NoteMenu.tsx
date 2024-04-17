import { Menu } from 'lucide-react-native'
import { Icon } from '@gluestack-ui/themed'
import type { NoteItem } from '../../../../server/src/modules/note/note'

interface Props {
  item: NoteItem
}

export function NoteMenu({ item }: Props) {
  return (
    <>
      <Icon as={Menu} />
    </>
  )
}
