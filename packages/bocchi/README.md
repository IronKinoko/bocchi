# bocchi

A cli build tool for userscript

## Install

```shell
# npm
npm i bocchi -D

# yarn
yarn add bocchi -D

# pnpm
pnpm i bocchi -D
```

### Create with template

```shell
# npm
npm create bocchi-app <name>

# yarn
yarn create bocchi-app <name>

# pnpm
pnpm create bocchi-app <name>
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
    "dev": "bocchi dev",
    "build": "bocchi build"
  }
}
```

4. `npm run dev` for development, `npm run build` for bundle production
