import { Plugin } from 'rollup'
import fs from 'fs-extra'
import path from 'path'

/**
 * Rollup plugin to import files as raw text using ?raw suffix
 */
export function raw(): Plugin {
  return {
    name: 'raw',
    resolveId(id, importer) {
      // Check if the import ends with ?raw
      if (id.endsWith('?raw')) {
        const actualPath = id.slice(0, -4) // Remove ?raw suffix
        
        if (importer) {
          // Resolve relative paths
          const resolved = path.resolve(path.dirname(importer), actualPath)
          return resolved + '?raw'
        }
        
        return actualPath + '?raw'
      }
      
      return null
    },
    
    load(id) {
      // Check if this is a raw import
      if (id.endsWith('?raw')) {
        const filePath = id.slice(0, -4) // Remove ?raw suffix
        
        try {
          // Read the file as text and export as a string
          const content = fs.readFileSync(filePath, 'utf-8')
          return `export default ${JSON.stringify(content)};`
        } catch (error) {
          this.error(`Could not load file ${filePath}: ${error}`)
        }
      }
      
      return null
    }
  }
}
