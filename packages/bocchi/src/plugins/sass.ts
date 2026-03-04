import type { Plugin } from 'rolldown'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import * as sass from 'sass'

const STYLE_RUNTIME_ID = 'virtual:bocchi-style-runtime'
const RESOLVED_STYLE_RUNTIME_ID = `\0${STYLE_RUNTIME_ID}`

const STYLE_RUNTIME_CODE = `export function injectStyle(css) {
  if (typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-bocchi', '');
  document.head.append(style);

  style.textContent = css;
}
`

const CSS_URL_PATTERN = /url\(([^)]*)\)/g

function isExternalUrl(url: string) {
  return (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('blob:') ||
    url.startsWith('#') ||
    url.startsWith('/')
  )
}

function splitResourcePath(url: string) {
  return url.split('?')[0].split('#')[0]
}

function resolveCssUrls(css: string, fromFile: string) {
  const inlined = new Map<string, string>()

  const nextCss = css.replace(CSS_URL_PATTERN, (fullMatch, source) => {
    const rawContent = String(source).trim()
    const quote =
      (rawContent.startsWith('"') && rawContent.endsWith('"')) ||
      (rawContent.startsWith("'") && rawContent.endsWith("'"))
        ? rawContent[0]
        : ''
    const rawUrl = quote ? rawContent.slice(1, -1).trim() : rawContent

    if (!rawUrl || isExternalUrl(rawUrl)) {
      return fullMatch
    }

    const filePath = splitResourcePath(rawUrl)
    const absolutePath = path.resolve(path.dirname(fromFile), filePath)

    if (!fs.existsSync(absolutePath)) {
      return fullMatch
    }

    let dataUri = inlined.get(absolutePath)
    if (!dataUri) {
      dataUri = toDataUri(absolutePath)
      if (!dataUri) {
        return fullMatch
      }
      inlined.set(absolutePath, dataUri)
    }

    return `url(${dataUri})`
  })

  return {
    css: nextCss,
    deps: Array.from(inlined.keys()),
  }
}

function toStyleModuleCode(css: string) {
  return `import { injectStyle } from ${JSON.stringify(STYLE_RUNTIME_ID)};
injectStyle(${JSON.stringify(css)});`
}

function isStyleFile(id: string) {
  return /\.s[ac]ss$|\.css$/.test(id)
}

function toDataUri(absolutePath: string) {
  const ext = path.extname(absolutePath).slice(1).toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
  }
  const mimeType = mimeMap[ext]
  if (!mimeType) {
    return undefined
  }
  const source = fs.readFileSync(absolutePath)
  return `data:${mimeType};base64,${source.toString('base64')}`
}

export function sassPlugin(): Plugin {
  return {
    name: 'style',
    resolveId(source) {
      if (source === STYLE_RUNTIME_ID) {
        return RESOLVED_STYLE_RUNTIME_ID
      }
      return null
    },
    async load(id) {
      if (id === RESOLVED_STYLE_RUNTIME_ID) {
        return {
          code: STYLE_RUNTIME_CODE,
          moduleType: 'js',
        }
      }

      if (!isStyleFile(id)) {
        return null
      }

      this.addWatchFile(id)

      if (id.endsWith('.css')) {
        const content = fs.readFileSync(id, 'utf-8')
        const resolved = resolveCssUrls(content, id)
        resolved.deps.forEach((dep) => this.addWatchFile(dep))

        return {
          code: toStyleModuleCode(resolved.css),
          moduleType: 'js',
        }
      }

      const result = await sass.compileAsync(id, {
        style: 'expanded',
        loadPaths: [process.cwd()],
      })

      for (const file of result.loadedUrls) {
        this.addWatchFile(fileURLToPath(file))
      }

      const resolved = resolveCssUrls(result.css, id)
      resolved.deps.forEach((dep) => this.addWatchFile(dep))

      return {
        code: toStyleModuleCode(resolved.css),
        moduleType: 'js',
      }
    },
  }
}
