import { useCallback, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  ButtonGroup,
  ButtonText,
  CloseIcon,
  Heading,
  Icon,
  Text,
} from '@gluestack-ui/themed'

interface Props {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
  content?: string
  cancelText?: string
  okText?: string
  onOk: () => void
}

export function CustomDialog({
  children,
  isOpen,
  onClose,
  title,
  content,
  cancelText = '取消',
  okText = '确认',
  onOk,
}: Props) {
  return (
    <>
      {children}
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="sm" color="$trueGray600">{title}</Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          {content && (
            <AlertDialogBody>
              <Text size="sm">
                {content}
              </Text>
            </AlertDialogBody>
          )}
          <AlertDialogFooter>
            <ButtonGroup space="lg">
              <Button
                variant="link"
                action="secondary"
                size="sm"
                onPress={() => {
                  onClose()
                }}
              >
                <ButtonText>{cancelText}</ButtonText>
              </Button>
              <Button
                bg="$error600"
                action="negative"
                size="sm"
                onPress={() => {
                  onClose()
                  onOk()
                }}
              >

                <ButtonText>{okText}</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useDialog(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    openDialog,
    closeDialog,
  }
}
