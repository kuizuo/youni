import { Menu } from 'lucide-react-native'
import { Button, ButtonIcon } from '@gluestack-ui/themed'
import type { NoteItem } from '../../../../server/src/modules/note/note'

interface Props {
  item: NoteItem
}

export function NoteMenu({ item }: Props) {
  return (
    <>
      <Button variant="link" onPress={() => { }}>
        <ButtonIcon as={Menu} />
      </Button>
    </>
  )
}
