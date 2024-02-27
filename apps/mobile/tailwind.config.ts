// @ts-expect-error - no types
import nativewind from 'nativewind/preset'
import type { Config } from 'tailwindcss'

import baseConfig from '../../tooling/tailwind/native'

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  presets: [baseConfig, nativewind],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3498db",
          light: "#6bb9f0",
        },
      },
    },
  },
  plugins: [],
} satisfies Config
