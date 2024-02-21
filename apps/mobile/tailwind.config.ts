// @ts-expect-error - no types
import nativewind from 'nativewind/preset'
import type { Config } from 'tailwindcss'

import baseConfig from '../../tooling/tailwind/native'

export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts.tsx}'],
  presets: [baseConfig, nativewind],
} satisfies Config
