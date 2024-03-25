import { TamaguiProvider as TamaguiProviderOG } from 'tamagui'
import { config } from '../../tamagui.config'
import { useRootTheme } from '../theme'

export function TamaguiProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [currentTheme] = useRootTheme()

  return (
    <TamaguiProviderOG
      config={config}
      disableInjectCSS
      disableRootThemeClass
      defaultTheme={currentTheme}
    >
      {children}
    </TamaguiProviderOG>
  )
}
