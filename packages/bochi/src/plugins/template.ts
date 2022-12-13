import type { Plugin } from 'rollup'
import HTMLParser, { HTMLElement } from 'node-html-parser'
import fs from 'fs-extra'

function warn(message: string) {
  console.warn(`[html-template-plugin] ${message}`)
}

export function parseHTML(code: string) {
  const root = HTMLParser.parse(code)

  return root.childNodes.reduce<Record<string, string>>((res, node) => {
    switch (node.nodeType) {
      case HTMLParser.NodeType.ELEMENT_NODE: {
        const el = node as HTMLElement
        const code = el.toString()
        if (el.tagName !== 'TEMPLATE') {
          warn(`Only allow <template/> in template root\n  ${code}`)
          return res
        }
        if (!el.id) {
          warn(`Each <template/> need an \`id\` attr\n  ${code}`)
          return res
        }
        if (res[el.id]) {
          warn(`Duplicate <template/> \`id\`\n  - ${code}\n  - ${res[el.id]}`)
          return res
        }
        res[el.id] = code
        break
      }
    }
    return res
  }, {})
}

export function template(): Plugin {
  return {
    name: 'template',
    transform(code, id) {
      if (!id.endsWith('.template.html')) return null
      this.addWatchFile(id)

      const res = parseHTML(code)
      return { code: `export default ${JSON.stringify(res)}` }
    },
  }
}
