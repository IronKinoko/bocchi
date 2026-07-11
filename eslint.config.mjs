import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'e18e/prefer-static-regex': 'off',
  },
  lessOpinionated: true,
  stylistic: false,
})
