import type { Plugin } from 'rolldown'
import fs from 'fs-extra'
import { paths } from '../paths'

function resolveMeta() {
  let meta = fs.readFileSync(paths.meta, 'utf-8')
  const pkg = fs.readJsonSync(paths.package)

  meta = meta
    .replace(/#version#/g, pkg.version)
    .replace(/#description#/g, pkg.description)
    .replace(/#homepage#/g, pkg.homepage)

  return meta
}

function resolveDevMeta() {
  const meta = resolveMeta()
  const devMeta = meta
    .replace(/(@name.*)/, '$1 - Dev')
    .replace(/(\/\/ ==\/UserScript==.*)/, `// @require      file://${paths.output}\n$1`)
  return devMeta
}

export function userscript(): Plugin {
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
      return opts
    },
    generateBundle() {
      if (process.env.NODE_ENV === 'development') {
        const devMeta = resolveDevMeta()
        this.emitFile({
          source: devMeta,
          fileName: 'index.dev.js',
          type: 'asset',
        })
      }
    },
  }
}
