/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }],
    ],
    plugins: [
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development'
        },
      ],
      "react-native-reanimated/plugin",
      'jotai/babel/plugin-react-refresh',
    ]
  }
}
