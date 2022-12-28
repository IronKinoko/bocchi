#!/usr/bin/env node

import yargs from 'yargs'
import bocchi from './index'

yargs(process.argv.slice(2))
  .usage('A cli build tool for userscript')
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .command(
    'dev',
    'build development file with watch mode',
    () => {},
    () => bocchi({ mode: 'development' })
  )
  .command(
    'build',
    'build production file',
    () => {},
    () => bocchi({ mode: 'production' })
  )
  .alias({ v: 'version', h: 'help' }).argv
