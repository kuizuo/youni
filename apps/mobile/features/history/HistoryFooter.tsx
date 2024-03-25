import { Check } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useId } from 'react'
import { useAtom } from 'jotai'
import { trpc } from '@/utils/trpc'
import { Button, Checkbox, Label, XStack, useTheme } from '@/ui'
import { historyStateAtoms } from '@/atoms/history'

export function HistoryFooter() {
  const theme = useTheme()
  const { bottom } = useSafeAreaInsets()

  const [isManageMode, setIsManageMode] = useAtom(historyStateAtoms.isManageMode)
  const [selectdItems, setSelectedItems] = useAtom(historyStateAtoms.selectedItems)

  const [selectAll, setSelectAll] = useAtom(historyStateAtoms.selectAll)
  const [items, setItems] = useAtom(historyStateAtoms.items)

  const id = useId()

  const { mutateAsync: deleteHistory } = trpc.history.batchDelete.useMutation()

  async function handleDelete() {
    await deleteHistory({ ids: selectdItems })
  }

  function handleCheckedChange(checked) {
    setSelectAll(checked)

    if (checked)
      setSelectedItems([...items])
    else
      setSelectedItems([])
  }

  return (
    <>
      {isManageMode
      && (
        <XStack py="$2" pb={bottom || '$2'} mx="$3" gap="$3" jc="space-between" ai="center">
          <XStack flex={1} ai="center" gap="$3">
            <Checkbox
              id={id}
              size="$4"
              bg={selectAll ? theme.$accent10?.get() : '$gray'}
              borderColor={selectAll ? theme.$accent10?.get() : '$gray8'}
              checked={selectAll}
              onCheckedChange={handleCheckedChange}
            >
              <Checkbox.Indicator>
                <Check color="white" />
              </Checkbox.Indicator>
            </Checkbox>
            <Label size="$4" htmlFor={id}>
              全选
            </Label>
          </XStack>
          <Button width={80} size="$3" color="white" bg={theme.$accent10?.get()} br={50} onPress={handleDelete}>删除</Button>
        </XStack>
      )}
    </>
  )
}
