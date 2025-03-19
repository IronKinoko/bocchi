import styles from '@ironkinoko/rollup-plugin-styles'
import commonjs from '@rollup/plugin-commonjs'
import image from '@rollup/plugin-image'
import nodeResolve from '@rollup/plugin-node-resolve'
import chalk from 'chalk'
import fs from 'fs-extra'
import { createRequire } from 'module'
import prettyMilliseconds from 'pretty-ms'
import * as rollup from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import slash from 'slash'
import { paths } from './paths'
import { template } from './plugins/template'
import { userscript } from './plugins/userscript'
import copy from 'rollup-plugin-copy'

function createRollupConfig() {
  const pkg = fs.readJsonSync(paths.package)

  const require = createRequire(import.meta.url)
  return rollup.defineConfig({
    input: paths.input,
    output: { file: paths.output, format: 'iife' },
    plugins: [
      styles({ sass: { impl: require.resolve('sass') } }),
      image(),
      template(),
      copy({
        targets: [{ src: paths.resolveApp('public/*'), dest: paths.dist }],
      }),
      esbuild({
        target: 'es2017',
        define: {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.env.APP_NAME': JSON.stringify(pkg.name),
          'process.env.APP_VERSION': JSON.stringify(pkg.version),
        },
      }),
      commonjs(),
      nodeResolve({ browser: true }),
      userscript(),
    ],
  })
}

function dateTime() {
  let date = new Date()
  date = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

function relativeId(source: string) {
  return slash(source).replace(slash(paths.root) + '/', '')
}

function handleError(error: rollup.RollupError) {
  const name = error.name || error.cause?.name
  const nameSection = name ? `${name}: ` : ''
  const pluginSection = error.plugin ? `(plugin ${error.plugin}) ` : ''
  const message = `${pluginSection}${nameSection}${error.message}`
  const { bold, red, cyan, dim } = chalk
  console.log(bold(red(`[!] ${message.toString()}`)))
  if (error.url) {
    console.log(cyan(error.url))
  }
  if (error.loc) {
    console.log(
      `${relativeId((error.loc.file || error.id)!)} (${error.loc.line}:${
        error.loc.column
      })`
    )
  } else if (error.id) {
    console.log(relativeId(error.id))
  }
  if (error.frame) {
    console.log(dim(error.frame))
  }
  if (error.stack) {
    console.log(dim(error.stack))
  }
  console.log('')
}

export function watch() {
  const config = createRollupConfig()

  const watcher = rollup.watch(config)

  watcher.on('event', (e) => {
    switch (e.code) {
      case 'START':
        console.clear()
        fs.removeSync(paths.dist)
        break
      case 'BUNDLE_START':
        let input = e.input!
        if (typeof input !== 'string') {
          input = Array.isArray(input)
            ? input.join(', ')
            : Object.values(input).join(', ')
        }
        console.log(
          chalk.cyan(
            `bundles ${chalk.bold(relativeId(input))} → ${chalk.bold(
              e.output.map(relativeId).join(', ')
            )} ...`
          )
        )
        break

      case 'BUNDLE_END':
        console.log(
          chalk.green(
            `created ${chalk.bold(
              e.output.map(relativeId).join(', ')
            )} in ${chalk.bold(prettyMilliseconds(e.duration))}`
          )
        )
        break

      case 'END':
        console.log(`\n[${dateTime()}] waiting for changes...`)
        break
      case 'ERROR':
        handleError(e.error)
        break
    }
  })
}

export async function build() {
  const config = createRollupConfig()

  console.log(
    chalk.cyan(
      `bundles ${chalk.bold(relativeId(paths.input))} → ${chalk.bold(
        relativeId(paths.output)
      )}...`
    )
  )

  try {
    await fs.remove(paths.dist)
    const start = Date.now()
    const bundle = await rollup.rollup(config)

    console.log(
      chalk.green(
        `created ${chalk.bold(relativeId(paths.output))} in ${chalk.bold(
          prettyMilliseconds(Date.now() - start)
        )}`
      )
    )

    await bundle.write(config.output as any)
    await bundle.close()
  } catch (error) {
    handleError(error as rollup.RollupError)
  }
}
