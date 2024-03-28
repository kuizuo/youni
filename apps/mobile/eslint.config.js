const antfu = require('@antfu/eslint-config').default

module.exports = antfu(
  {
    react: true,
    rules: {
      'ts/ban-ts-comment': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'ts/no-use-before-define': 'off',
      'react/display-name': 'off',
      'ts/no-require-imports': 'off',
    },
    ignores: [
      './ui/themes/*.ts',
    ],
  },
)
