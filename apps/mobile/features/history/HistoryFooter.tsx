
import { XStack, Checkbox, Button, Theme, Label, CheckedState, useTheme } from '@/ui'
import { Check } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { historyStateAtoms } from '@/atoms/history'
import { useId, useState } from 'react'
import { trpc } from '@/utils/trpc'
import { useAtom } from 'jotai'

export const HistoryFooter = () => {
  const theme = useTheme()
  const { bottom } = useSafeAreaInsets()

  const [isManageMode, setIsManageMode] = useAtom(historyStateAtoms.isManageMode)
  const [selectdItems, setSelectedItems] = useAtom(historyStateAtoms.selectedItems)

  const [selectAll, setSelectAll] = useAtom(historyStateAtoms.selectAll)
  const [items, setItems] = useAtom(historyStateAtoms.items);

  const id = useId()

  const { mutateAsync: deleteHistory } = trpc.history.batchDelete.useMutation()

  async function handleDelete() {
    await deleteHistory({ ids: selectdItems })
  }

  function handleCheckedChange(checked) {
    setSelectAll(checked)

    if (checked) {
      setSelectedItems([...items])
    } else {
      setSelectedItems([])
    }
  }

  return <>
    {isManageMode &&
      <XStack paddingVertical='$2' paddingBottom={bottom || '$2'} marginHorizontal="$3" gap="$3" justifyContent='space-between' alignItems="center" >
        <XStack flex={1} alignItems="center" gap="$3">
          <Checkbox
            id={id}
            size="$4"
            backgroundColor={selectAll ? theme.$accent10?.get() : '$gray'}
            borderColor={selectAll ? theme.$accent10?.get() : '$gray8'}
            checked={selectAll}
            onCheckedChange={handleCheckedChange}
          >
            <Checkbox.Indicator>
              <Check color={'white'} />
            </Checkbox.Indicator>
          </Checkbox>
          <Label size={'$4'} htmlFor={id}>
            全选
          </Label>
        </XStack>
        <Button width={80} size={'$3'} color="white" backgroundColor={theme.$accent10?.get()} borderRadius={50} onPress={handleDelete}>删除</Button>
      </XStack>
    }
  </>
}