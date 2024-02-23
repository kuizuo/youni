module.exports = {
  root: true,
  extends: [
    'universe/native',
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
  ],
  ignorePatterns: [
    'expo-plugins/**'
  ]
};