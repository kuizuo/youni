import { DarkTheme, DefaultTheme, ThemeProvider as ThemeProviderOg } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useLayoutEffect } from 'react'
import { Appearance, View } from 'react-native'
import { useColorScheme } from 'nativewind'
import { storage } from '../kv'
import type { ThemeVariant } from '@/utils/theme'
import { themeVariant } from '@/utils/theme'
import { appThemeKey, useAppTheme, useCurrentTheme } from '@/atoms/theme'
import { useForceUpdate } from '@/ui'

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme()
  const [appTheme, setAppTheme] = useAppTheme()
  const [currentTheme] = useCurrentTheme()
  const forceUpdate = useForceUpdate()

  const defaultTheme = 'system'
  const statusBarStyle = currentTheme === themeVariant.dark ? themeVariant.light : themeVariant.dark
  const themeValue = currentTheme === themeVariant.dark ? DarkTheme : DefaultTheme

  useEffect(() => {
    const systemThemeChangeListener = Appearance.addChangeListener(() => {
      setAppTheme(Appearance.getColorScheme() as ThemeVariant)
      forceUpdate()
    })
    return () => {
      systemThemeChangeListener.remove()
    }
  }, [setAppTheme, forceUpdate])

  useLayoutEffect(() => {
    const savedAppTheme = storage.getString(appThemeKey)
    if (savedAppTheme !== undefined)
      setAppTheme(savedAppTheme as ThemeVariant)
  }, [setAppTheme])

  useEffect(() => {
    if (appTheme === undefined) {
      storage.set(appThemeKey, defaultTheme)
      setAppTheme(defaultTheme)
    }
    else {
      storage.set(appThemeKey, appTheme)
    }
  }, [appTheme, setAppTheme])

  return (
    <ThemeProviderOg value={themeValue}>
      <StatusBar style={statusBarStyle} />
      <View className="flex-1">
        {children}
      </View>
    </ThemeProviderOg>
  )
}

export function useRootTheme() {
  const [currentTheme] = useCurrentTheme()
  return [currentTheme]
}
