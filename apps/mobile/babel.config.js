/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }],
    ],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['../..'],
          alias: {
            app: '../../packages/app',
            '@youni/ui': '../../packages/ui',
          },
          extensions: ['.js', '.jsx', '.tsx', '.ios.js', '.android.js'],
        },
      ],
      ...(process.env.EAS_BUILD_PLATFORM === 'android'
        ? []
        : [
          [
            '@tamagui/babel-plugin',
            {
              components: ['@youni/ui', 'tamagui'],
              config: './tamagui.config.ts',
            logTimings: true,
            disableExtraction: process.env.NODE_ENV === 'development'
          },
        ],
      ]),
      "react-native-reanimated/plugin",
      'jotai/babel/plugin-react-refresh',
    ]
  }
}
