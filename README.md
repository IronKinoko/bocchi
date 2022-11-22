# bochi

A cli build tool for userscript

## Install

```shell
# npm
npm i bochi -D

# yarn
yarn add bochi -D

# pnpm
pnpm i bochi -D
```

### create with template

```shell
# npm
npm create bochi <name>

# yarn
yarn create bochi <name>

# pnpm
pnpm create bochi <name>
```

## Usage

1. create `meta.template`

```
// ==UserScript==
// @name
// @namespace    #homepage#
// @version      #version#
// @description  #description#
// @author
// @match        https://example.com/*
// @grant        none
// @downloadURL
// @updateURL
// ==/UserScript==
```

2. write entry `src/index.(j|t)s`
3. add scripts to `package.json`

```json
{
  "scripts": {
    "dev": "bochi dev",
    "build": "bochi build"
  }
}
```

4. `npm run dev` for development, `npm run build` for bundle production