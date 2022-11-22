import { build, watch } from './rollup'

export interface Options {
  mode: 'development' | 'production'
}
const defaultOptions: Options = {
  mode: 'development',
}

export default function bochi(opts = defaultOptions) {
  process.env.NODE_ENV = opts.mode

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) watch()
  else build()
}
