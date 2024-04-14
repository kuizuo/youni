import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '@/tailwind.config'

export const twConfig = resolveConfig(tailwindConfig)

export const theme = twConfig.theme
