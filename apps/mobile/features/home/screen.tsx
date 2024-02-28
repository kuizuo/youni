import {
  Anchor,
  Button,
  H1,
  H3,
  Paragraph,
  ScrollView,
  Separator,
  Sheet,
  XStack,
  Text,
  YStack,
  useToastController,
} from '@/ui'
import { ThemeToggle } from '@/ui/ThemeToggle'
import { ChevronDown } from '@tamagui/lucide-icons'
import { trpc } from '@/utils/trpc'
import React, { useState } from 'react'
import { Linking } from 'react-native'
import { Link, Stack } from 'expo-router';
import { useSheetOpen } from '../../atoms/sheet'
import { useUser } from '@/utils/auth/hooks/useUser'

export function HomeScreen() {
  const utils = trpc.useContext()
  const { user } = useUser()
  const toast = useToastController()

  return (
    <ScrollView backgroundColor={'$background'}>
      <YStack flex={1} justifyContent='center' alignItems='center' padding='$4' space='$4'>
        <H1 textAlign='center'>👋 Hello, T4 App</H1>
        <Separator />
        <Paragraph textAlign='center' size={'$2'}>
          Unifying React Native + Web.
        </Paragraph>
        <Paragraph textAlign='center' size={'$2'}>
          The T4 Stack is made by{' '}
          <Anchor href='https://twitter.com/ogtimothymiller' target='_blank'>
            Tim Miller
          </Anchor>
          , give it a star{' '}
          <Anchor href='https://github.com/timothymiller/-app' target='_blank' rel='noreferrer'>
            on Github.
          </Anchor>
        </Paragraph>
        <Paragraph textAlign='center' size={'$2'}>
          Tamagui is made by{' '}
          <Anchor href='https://twitter.com/natebirdman' target='_blank'>
            Nate Weinert
          </Anchor>
          , give it a star{' '}
          <Anchor href='https://github.com/tamagui/tamagui' target='_blank' rel='noreferrer'>
            on Github.
          </Anchor>
        </Paragraph>

        <XStack gap='$5'>
          <Button onPress={() => Linking.openURL('https://stack.com/')}>Learn More...</Button>
          <ThemeToggle />
        </XStack>

        <H3>🦮🐴 App Demos</H3>
        <YStack gap='$2'>
          <Link href="/data-fetching" asChild style={{ 'textDecorationLine': 'none' }}>
            <Button gap='$2'>
              Fetching Data
            </Button>
          </Link>

          <Button
            onPress={() => {
              toast.show('Hello world!', {
                message: 'Description here',
              })
            }}
          >
            Show Toast
          </Button>
          <SheetDemo />
        </YStack>
      </YStack>
    </ScrollView>
  )
}

const SheetDemo = (): React.ReactNode => {
  const [open, setOpen] = useSheetOpen()
  const [position, setPosition] = useState(0)

  return (
    <>
      <Button onPress={() => setOpen((x) => !x)} gap='$2'>
        Bottom Sheet
      </Button>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame alignItems='center' justifyContent='center'>
          <Sheet.Handle />
          <Button
            size='$6'
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
