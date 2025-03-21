import path from 'path'
import fs from 'fs-extra'
import slash from 'slash'

function resolveApp(...rest: string[]) {
  return slash(path.resolve(process.cwd(), ...rest))
}

function resolveInput() {
  const base = resolveApp('src', 'index')
  const index = ['.ts', '.js']
    .map((extension) => base + extension)
    .find((file) => fs.existsSync(file))

  if (!index) throw new Error('ensure src/index.(j|t)s exists')
  return index
}

export const paths = {
  resolveApp,
  root: resolveApp(),
  meta: resolveApp('meta.template'),
  package: resolveApp('package.json'),
  public: resolveApp('public'),
  dist: resolveApp('dist'),
  input: resolveInput(),
  output: resolveApp('dist', 'index.user.js'),
  outputDev: resolveApp('dist', 'index.dev.js'),
}
