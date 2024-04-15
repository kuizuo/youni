import { useState } from 'react'
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
  Center,
  CloseIcon,
  Heading,
  Icon,
  Text,
} from '@gluestack-ui/themed'

interface Props {
  children: React.ReactNode
  title: string
  content?: string
  cancelText?: string
  okText?: string
  onOk: () => void
}

export function CustomDialog({
  children,
  title,
  content,
  cancelText = '取消',
  okText = '确认',
  onOk,
}: Props) {
  const [showAlertDialog, setShowAlertDialog] = useState(false)

  return (
    <>
      <Button size="xs" onPress={() => setShowAlertDialog(true)}>
        {children}
      </Button>
      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => {
          setShowAlertDialog(false)
        }}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">{title}</Heading>
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
                variant="outline"
                action="secondary"
                onPress={() => {
                  setShowAlertDialog(false)
                }}
              >
                <ButtonText>{cancelText}</ButtonText>
              </Button>
              <Button
                bg="$error600"
                action="negative"
                onPress={() => {
                  setShowAlertDialog(false)
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
