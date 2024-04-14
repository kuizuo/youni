import React from 'react'
import { View } from 'react-native'
import { OverlayProvider } from '@gluestack-ui/overlay'
import { ToastProvider } from '@gluestack-ui/toast'
import { GluestackUIProvider as GluestackUIProviderOg } from '@gluestack-ui/themed'

// import { config } from './config'
import { config } from '@gluestack-ui/config'

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: 'light' | 'dark'
  children?: any
}) {
  return (
  // <View
  //   style={[
  //     config[mode],
  //     { flex: 1, height: '100%', width: '100%' },
  //     // @ts-expect-error
  //     // eslint-disable-next-line react/prop-types
  //     props.style,
  //   ]}
  // >
  //   <OverlayProvider>
  //     <ToastProvider>{props.children}</ToastProvider>
  //   </OverlayProvider>
  // </View>

    <GluestackUIProviderOg config={config}>
      {props.children}
    </GluestackUIProviderOg>
  )
}
