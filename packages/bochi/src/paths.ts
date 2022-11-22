import path from 'path'

function resolveApp(...rest: string[]) {
  return path.resolve(process.cwd(), ...rest)
}
export const paths = {
  resolveApp,
  root: resolveApp(),
  meta: resolveApp('meta.template'),
  package: resolveApp('package.json'),
  input: resolveApp('src', 'index'),
  output: resolveApp('dist', 'index.user.js'),
  outputDev: resolveApp('dist', 'index.dev.js'),
}
