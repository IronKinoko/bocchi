import { parseHTML } from '../../packages/bochi/src/plugins/template'

it('should parse HTML to Object', () => {
  const code = `
  <template id="id1">
  1
    <span></span>
  </template>

  <template id="id2">
    <span></span>
    3
  </template>

  <a id="id3"></a>
  `
  const res = parseHTML(code)

  expect(Object.keys(res)).toStrictEqual(['id1', 'id2', 'id3'])

  expect(res).toMatchInlineSnapshot(`
    {
      "id1": "<template id="id1">
      1
        <span></span>
      </template>",
      "id2": "<template id="id2">
        <span></span>
        3
      </template>",
      "id3": "<a id="id3"></a>",
    }
  `)
})

it('should throw error', () => {
  const code = `
  <template id="id1">
    <span></span>
  </template>
  
  <template id="id1">
    <span></span>
  </template>
  `

  expect(() => parseHTML(code)).toThrowErrorMatchingInlineSnapshot(`
    "[html-template-plugin] Duplicate \`id\`
      - <template id="id1">
        <span></span>
      </template>
      - <template id="id1">
        <span></span>
      </template>"
  `)

  const code2 = `
  <code>
    <span></span>
  </code>
  `

  expect(() => parseHTML(code2)).toThrowErrorMatchingInlineSnapshot(`
    "[html-template-plugin] <code/> need an \`id\` attribute
      <code>
        <span></span>
      </code>"
  `)
})
