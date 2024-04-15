import { GluestackUIProvider as GluestackUIProviderOg, View } from '@gluestack-ui/themed'

import { useColorScheme } from 'nativewind'
import { config } from './gluestack-ui.config'

export function GluestackUIProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme()

  return (
    <GluestackUIProviderOg
      config={config}
      colorMode={colorScheme}
    >
      {children}
    </GluestackUIProviderOg>
  )
}
