import type { ReactNode } from 'react'
import { AlertDialog, Button, XStack, YStack } from '..'

interface Props {
  children: ReactNode
  title: string
  cancelText?: string
  okText?: string
  onOk: () => void
}

export function CustomDialog({
  children,
  title,
  cancelText = '取消',
  okText = '确认',
  onOk,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        {children}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack gap="$4" minWidth="80%">
            <AlertDialog.Title size="$4">{title}</AlertDialog.Title>
            <XStack gap="$3" jc="flex-end">
              <AlertDialog.Cancel asChild>
                <Button size="$2">{cancelText}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button size="$2" theme="red" onPress={onOk}>{okText}</Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
}
