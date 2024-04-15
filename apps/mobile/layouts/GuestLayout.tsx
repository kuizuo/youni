import React from 'react'
import { Box, ScrollView, StatusBar, VStack } from '@gluestack-ui/themed'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface GuestLayoutProps {
  children: React.ReactNode
}

export default function GuestLayout(props: GuestLayoutProps) {
  const { top } = useSafeAreaInsets()

  return (
    <Box
      sx={{
        _web: {
          height: '100vh',
          overflow: 'hidden',
        },
      }}
      height="$full"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView
        flex={1}
        contentContainerStyle={{
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
        }}
        pt={top}
        sx={{
          '@base': { _light: { bg: '$primary500' } },
          '@md': { _light: { bg: '$primary900' }, p: '$8' },
          '_dark': { bg: '$backgroundDark900' },
        }}
        bounces={false}
      >
        <VStack
          w="$full"
          flex={1}
          overflow="hidden"
          sx={{
            '@md': {
              maxWidth: '$containerWidth',
              flexDirection: 'row',
              rounded: '$xl',
              flex: undefined,
            },
          }}
        >
          {props.children}
        </VStack>
      </ScrollView>
    </Box>
  )
}
