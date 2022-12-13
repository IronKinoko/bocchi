import type { Plugin } from 'rollup'
import HTMLParser, { HTMLElement } from 'node-html-parser'

function die(message: string) {
  throw new SyntaxError(`[html-template-plugin] ${message}`)
}

export function parseHTML(code: string) {
  const root = HTMLParser.parse(code)

  const result = root.childNodes.reduce<Record<string, HTMLElement>>(
    (res, node) => {
      switch (node.nodeType) {
        case HTMLParser.NodeType.ELEMENT_NODE: {
          const el = node as HTMLElement
          if (!el.id)
            die(`<${el.rawTagName}/> need an \`id\` attribute\n  ${el}`)

          if (res[el.id]) die(`Duplicate \`id\`\n  - ${res[el.id]}\n  - ${el}`)

          res[el.id] = el
          break
        }
      }
      return res
    },
    {}
  )

  return Object.keys(result).reduce<Record<string, string>>((res, key) => {
    const el = result[key]
    res[key] = el.toString()
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
