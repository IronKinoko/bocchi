import { parseHTML } from '../../packages/bochi/src/plugins/template'

const code = `
<template id="id1">
  <span></span>
</template>

<template id="id2">
  <span></span>
</template>

<template id="id2">
  <span></span>
</template>

<template>
  <span></span>
</template>
<span></span>
`

it('should parse HTML to Object', () => {
  const fn = jest.fn()
  console.warn = fn

  const res = parseHTML(code)

  expect(Object.keys(res)).toStrictEqual(['id1', 'id2'])

  expect(fn).toHaveBeenCalledTimes(3)

  expect(res).toMatchInlineSnapshot(`
    {
      "id1": "<template id="id1">
      <span></span>
    </template>",
      "id2": "<template id="id2">
      <span></span>
    </template>",
    }
  `)
})
