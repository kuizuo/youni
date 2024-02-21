/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo',
        {
          // Use React 17 automatic JSX runtime.
          jsxRuntime: "automatic",
          jsxImportSource: "nativewind"
        },
      ],
      "nativewind/babel",
    ],
  }
}
