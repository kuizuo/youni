import { config as defaultConfig } from '@gluestack-ui/config'
import { createConfig } from '@gluestack-ui/themed'

const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      white: '#FFFFFF',
      black: '#000000',
      primary50: defaultConfig.tokens.colors.red50,
      primary100: defaultConfig.tokens.colors.red100,
      primary200: defaultConfig.tokens.colors.red200,
      primary300: defaultConfig.tokens.colors.red300,
      primary400: defaultConfig.tokens.colors.red400,
      primary500: defaultConfig.tokens.colors.red500,
      primary600: defaultConfig.tokens.colors.red600,
      primary700: defaultConfig.tokens.colors.red700,
      primary800: defaultConfig.tokens.colors.red800,
      primary900: defaultConfig.tokens.colors.red900,

      secondary0: '#FCFCFC',
      secondary50: '#f9fafb',
      secondary100: '#f3f4f6',
      secondary200: '#e4e7eb',
      secondary300: '#d1d5da',
      secondary400: '#9ca3af',
      secondary500: '#6b7280',
      secondary600: '#4b5563',
      secondary700: '#374151',
      secondary800: '#1f2937',
      secondary900: '#111827',
      secondary950: '#171717',

      backgroundDark0: '#FFFFFF',
      backgroundDark50: '#f9fafb',
      backgroundDark100: '#f3f4f6',
      backgroundDark200: '#e4e7eb',
      backgroundDark300: '#d1d5da',
      backgroundDark400: '#9ca3af',
      backgroundDark500: '#6b7280',
      backgroundDark600: '#4b5563',
      backgroundDark700: '#374151',
      backgroundDark800: '#1f2937',
      backgroundDark900: '#111827',
      backgroundDark950: '#171717',

      backgroundLight0: '#FFFFFF',
      backgroundLight50: '#f9fafb',
      backgroundLight100: '#f3f4f6',
      backgroundLight200: '#e4e7eb',
      backgroundLight300: '#d1d5da',
      backgroundLight400: '#9ca3af',
      backgroundLight500: '#6b7280',
      backgroundLight600: '#4b5563',
      backgroundLight700: '#374151',
      backgroundLight800: '#1f2937',
      backgroundLight900: '#111827',
      backgroundLight950: '#171717',

      backgroundLightError: '#FEF1F1',
      backgroundDarkError: '#2E2020',
      backgroundLightWarning: '#FFF4EB',
      backgroundDarkWarning: '#2E231B',
      backgroundLightSuccess: '#EDFCF2',
      backgroundDarkSuccess: '#1C2B21',
      backgroundLightInfo: '#EBF8FE',
      backgroundDarkInfo: '#1A282E',
      backgroundLightMuted: '#F6F6F7',
      backgroundDarkMuted: '#252526',

      textLight0: '#FFFFFF',
      textLight50: '#f9fafb',
      textLight100: '#f3f4f6',
      textLight200: '#e4e7eb',
      textLight300: '#d1d5da',
      textLight400: '#9ca3af',
      textLight500: '#6b7280',
      textLight600: '#4b5563',
      textLight700: '#374151',
      textLight800: '#1f2937',
      textLight900: '#111827',
      textLight950: '#171717',

      borderLight0: '#FFFFFF',
      borderLight50: '#f9fafb',
      borderLight100: '#f3f4f6',
      borderLight200: '#e4e7eb',
      borderLight300: '#d1d5da',
      borderLight400: '#9ca3af',
      borderLight500: '#6b7280',
      borderLight600: '#4b5563',
      borderLight700: '#374151',
      borderLight800: '#1f2937',
      borderLight900: '#111827',
      borderLight950: '#171717',

      borderDark0: '#FFFFFF',
      borderDark50: '#f9fafb',
      borderDark100: '#f3f4f6',
      borderDark200: '#e4e7eb',
      borderDark300: '#d1d5da',
      borderDark400: '#9ca3af',
      borderDark500: '#6b7280',
      borderDark600: '#4b5563',
      borderDark700: '#374151',
      borderDark800: '#1f2937',
      borderDark900: '#111827',
      borderDark950: '#171717',
    },
  },
  components: {
    ...defaultConfig.components,
  },
  aliases: {
    ...defaultConfig.aliases,
    jc: 'justifyContent',
    ai: 'alignItems',
    fd: 'flexDirection',
    br: 'borderRadius',
  },
} as const)

export { config }

// Get the type of Config
type ConfigType = typeof config

// Extend the internal styled config
type Components = typeof defaultConfig.components
// Extend the internal styled config
declare module '@gluestack-style/react' {
  // interface UIConfig extends ConfigType {}

  interface ICustomConfig extends ConfigType { }
  interface ICustomComponents extends Components { }
}
