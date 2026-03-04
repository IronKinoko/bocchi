import type { Plugin } from 'rolldown'
import fs from 'fs-extra'

/**
 * Rollup plugin to import files as raw text using ?raw suffix
 */
export function raw(): Plugin {
  return {
    name: 'raw',
    load: {
      filter: { id: /\?raw$/ },
      async handler(id) {
        const filePath = id.slice(0, -4) // Remove ?raw suffix
        this.addWatchFile(filePath)

        const content = fs.readFileSync(filePath, 'utf-8')
        return {
          code: `export default ${JSON.stringify(content)};`,
        }
      },
    },
  }
}
