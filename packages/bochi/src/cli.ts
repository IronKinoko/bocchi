#!/usr/bin/env node

import yargs from 'yargs'
import bochi from './index'

yargs
  .usage('A cli build tool for userscript')
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .command(
    'dev',
    'build development file with watch mode',
    () => {},
    () => bochi({ mode: 'development' })
  )
  .command(
    'build',
    'build production file',
    () => {},
    () => bochi({ mode: 'production' })
  )
  .alias({ v: 'version', h: 'help' }).argv
