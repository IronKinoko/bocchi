import { Plugin } from 'rollup'
import fs from 'fs-extra'

/**
 * Rollup plugin to import files as raw text using ?raw suffix
 */
export function raw(): Plugin {
  return {
    name: 'raw',
    load(id) {
      if (id.endsWith('?raw')) {
        const filePath = id.slice(0, -4) // Remove ?raw suffix
        this.addWatchFile(filePath)

        const content = fs.readFileSync(filePath, 'utf-8')
        return `export default ${JSON.stringify(content)};`
      }

      return null
    },
  }
}
