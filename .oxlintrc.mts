import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['vitest'],
  rules: {
    'no-console': 'off',
  },
})
