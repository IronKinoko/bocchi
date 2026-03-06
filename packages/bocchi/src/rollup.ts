import chalk from 'chalk'
import fs from 'fs-extra'
import prettyMilliseconds from 'pretty-ms'
import * as rolldown from 'rolldown'
import copy from 'rollup-plugin-copy'
import slash from 'slash'
import { paths } from './paths'
import { raw } from './plugins/raw'
import { sassPlugin } from './plugins/sass'
import { template } from './plugins/template'
import { userscript } from './plugins/userscript'

function createRollupConfig() {
  const pkg = fs.readJsonSync(paths.package)

  return rolldown.defineConfig({
    input: paths.input,
    output: { file: paths.output, format: 'iife' },
    transform: {
      target: 'es2017',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.APP_NAME': JSON.stringify(pkg.name),
        'process.env.APP_VERSION': JSON.stringify(pkg.version),
      },
    },
    plugins: [
      raw(),
      sassPlugin(),
      template(),
      copy({
        targets: [{ src: paths.resolveApp('public/*'), dest: paths.dist }],
      }),
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
  return slash(source).replace(`${slash(paths.root)}/`, '')
}

function handleError(error: rolldown.RollupError) {
  const name = error.name || (error.cause as any)?.name
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

  const watcher = rolldown.watch(config)

  watcher.on('event', (e) => {
    switch (e.code) {
      case 'START':
        console.clear()
        fs.removeSync(paths.dist)
        break
      case 'BUNDLE_START':
        console.log(
          chalk.cyan(
            `bundles ${chalk.bold(relativeId(paths.input))} → ${chalk.bold(
              relativeId(paths.output)
            )}...`
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

  let bundle
  let failed = false
  try {
    await fs.remove(paths.dist)
    const start = performance.now()
    bundle = await rolldown.rolldown(config)
    await bundle.write(config.output as rolldown.OutputOptions)

    console.log(
      chalk.green(
        `created ${chalk.bold(relativeId(paths.output))} in ${chalk.bold(
          prettyMilliseconds(performance.now() - start)
        )}`
      )
    )
  } catch (error) {
    failed = true
    handleError(error as rolldown.RollupError)
  } finally {
    if (bundle) {
      await bundle.close()
    }

    process.exitCode = failed ? 1 : 0
  }
}
