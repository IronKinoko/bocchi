# bocchi

一个用于油猴用户脚本(userscript)的构建工具

## 安装

```shell
# npm
npm i bocchi -D

# yarn
yarn add bocchi -D

# pnpm
pnpm i bocchi -D
```

### 使用模板创建

```shell
# npm
npm create bocchi-app <name>

# yarn
yarn create bocchi-app <name>

# pnpm
pnpm create bocchi-app <name>
```

## 使用方法

1. 在 `package.json` 同级目录创建 `meta.template`

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

2. 编写入口文件 `src/index.(j|t)s`
3. 在 `package.json` 中添加脚本

```json
{
  "scripts": {
    "dev": "bocchi dev",
    "build": "bocchi build"
  }
}
```

4. 使用 `npm run dev` 进行开发，使用 `npm run build` 进行生产打包

## 功能

1. 支持引入第三方链接，将依赖库排除出源码

- 以 jszip 为例，先安装 jszip 用于提供代码提示

```shell
npm i jszip
```

- 在 `package.json` 文件中添加 globals 对象，填写规则为 `{"包名称": "全局变量名称"}`

```diff
{
  "dependencies": {
    "jszip": "^3.10.1"
  },
+  "globals": {
+    "jszip": "JSZip"
+  }
}
```

- 在 `/meta.template` 文件中引入第三方链接

```diff
// ==UserScript==
// @name
// @namespace    #homepage#
// @version      #version#
// @description  #description#
// @author
// @match        https://example.com/*
// @grant        none
+ // @require      https://unpkg.com/jszip@3.10.1/dist/jszip.min.js
// ==/UserScript==
```

2. 支持 `[name].template.html`

`.template.html` 文件格式是本项目自定义的格式，该文件会输出一个对象供其他文件使用，对象的键为顶层且具有 id 的节点，值为对应节点的字符串

```html
<!-- 文件: hello.template.html -->
<template id="tmpId">
  <span>1</span>
</template>

<a id="anchorId"></a>
```

```js
// 文件: index.js
import tmp from './hello.template.html'

console.log(tmp.tmpId) //=> <template id="tmpId">\n  <span>1</span>\n</template>
console.log(tmp.anchorId) //=> <a id="anchorId"></a>
```

3. 自动加载 `postcss.config.js`
4. 支持引入 css、sass 文件

```js
import './test.css'
import './hello.sass'
```
