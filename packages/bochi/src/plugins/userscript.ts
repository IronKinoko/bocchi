import fs from 'fs-extra'
import { Plugin } from 'rollup'
import { paths } from '../paths'

function resolveMeta() {
  let meta = fs.readFileSync(paths.meta, 'utf-8')
  const pkg = fs.readJsonSync(paths.package)

  meta = meta.replace(/#version#/g, pkg.version)
  .replace(/#description#/g, pkg.description)
  .replace(/#homepage#/g, pkg.homepage)

  return meta
}

function genDevFile(meta: string) {
  const devMeta = meta
    .replace(/(@name.*)/, '$1 - Dev')
    .replace(/(\/\/ ==\/UserScript==.*)/, `// @require      file://${paths.output}\n$1`)

  fs.ensureFileSync(paths.outputDev)
  fs.writeFileSync(paths.outputDev, devMeta)
}

export interface UserscriptOptions {}

export function userscript(opts?: UserscriptOptions): Plugin {
  if (!fs.existsSync(paths.meta)) throw new Error('Missing meta.template file')

  return {
    name: 'userscript',
    options(opts) {
      const pkg = fs.readJsonSync(paths.package)

      opts.external = Object.keys(pkg.globals || {})
    },
    buildStart() {
      this.addWatchFile(paths.meta)
    },
    outputOptions(opts) {
      const meta = resolveMeta()
      opts.banner = meta

      const pkg = fs.readJsonSync(paths.package)

      opts.globals = pkg.globals

      if (process.env.NODE_ENV === 'development') {
        genDevFile(meta)
      }

      return opts
    },
  }
}
