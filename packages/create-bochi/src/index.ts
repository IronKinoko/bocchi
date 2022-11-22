#!/usr/bin/env node

import url from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const tmpRoot = path.resolve(__dirname, '../template')

const name = process.argv[2]
if (!name) throw new Error('please enter dir name')

const root = path.resolve(process.cwd(), name)

fs.cpSync(tmpRoot, root, { recursive: true })
