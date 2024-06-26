import { resolve } from 'node:path'

import swc from 'unplugin-swc'
import tsconfigPath from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// if (
//   existsSync(
//     path.resolve(__dirname, '../../node_modules/.cache/redis-memory-server'),
//   )
// ) {
//   cpSync(
//     path.resolve(__dirname, '../../node_modules/.cache/redis-memory-server'),
//     path.resolve(__dirname, './node_modules/.cache/redis-memory-server'),
//     { recursive: true },
//   )
// }

export default defineConfig({
  root: './',
  test: {
    include: ['./test/**/*.spec.ts', './test/**/*.e2e-spec.ts'],

    globals: true,
    setupFiles: [resolve(__dirname, 'test/setup.ts')],
    environment: 'node',
    includeSource: [resolve(__dirname, './test')],
  },
  optimizeDeps: {
    needsInterop: ['lodash'],
  },
  resolve: {
    alias: [
      {
        find: 'zx-cjs',
        replacement: 'zx',
      },
      {
        find: '@core/app.config',
        replacement: resolve(__dirname, './src/app.config.testing.ts'),
      },
      {
        find: /^@core\/(.+)/,
        replacement: resolve(__dirname, './src/$1'),
      },
    ],
  },

  // esbuild can not emit ts metadata
  esbuild: false,

  plugins: [
    swc.vite(),
    tsconfigPath({
      projects: [resolve(__dirname, './tsconfig.json')],
    }),
  ],
})
