const antfu = require('@antfu/eslint-config').default

module.exports = antfu(
  {
    react: true,
    rules: {
      'ts/ban-ts-comment': true,
    },
    ignores: [
      'ui/themes/**/*',
    ],
  },
)
