# sitedown

Turn some markdown files into a website.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![downloads][downloads-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/sitedown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sitedown
[travis-image]: https://img.shields.io/travis/hypermodules/sitedown.svg?style=flat-square
[travis-url]: https://travis-ci.org/hypermodules/sitedown
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://standardjs.com/
[downloads-image]: https://img.shields.io/npm/dm/sitedown.svg?style=flat-square

## Overview

Point sitedown at a folder with one or more markdown files and receive one free website!

- converts your `README.md` into a `index.html`
- creates directory indexes (`CHANGELOG.md` becomes `changelog/index.html`)
- accepts a layout file (comes with a default one too)
- has an experimental watch mode for working on a project locally
- built for making gh-pages sites
- supports subdirectories too

Sitedown's [website](https://hypermodules.github.io/sitedown) was built with sitedown, so you know it's *for real*.

## Install

```
npm install sitedown
```

## Usage

### CLI

```console
$ sitedown --help
Usage: sitedown [source] [options]

    Example: sitedown source/ -b build/ -l layout.html

    source                path to source directory (default: current working directory)
    --build, -b           path to build directory (default: "build")
    --pretty              use directory indexes for pretty URLs (default: true)
    --layout, -l          path to layout file
    --el, -e              css selector for target element (default: ".markdown-body")
    --github-headings, -g add anchors to headings just like GitHub (default: false)
    --silent, -s          make less noise during build
    --watch, -w           watch a directory or file (experimental)
    --version, -v         show version information
    --help, -h            show help
```

**Protip**: You *can* install a node command line utility globally (`npm install --global sitedown`), but it's usually *better* to install it locally (`npm install --save-dev sitedown`) and access it via `package.json` scripts (e.g. `"build-site": "sitedown ."`). This way you don't pollute the global environment with random scripts and your utility is saved and versioned side by side with your project. :sparkles:

### Node API

```js
var sitedown = require('sitedown')

var options = {
  source: '.',            // path to source directory                 default: cwd
  build: 'build',         // path to build directory                  default: 'build' in cwd
  pretty: true,           // use directory indexes for pretty URLs    default: true
  el: '.markdown-body',   // css selector for target element          default: '.markdown-body'
  layout: 'layout.html',  // path to layout                           default: none
  githubHeadings: false   // add anchors to headings just like GitHub default: false
  silent: false           // make less noise during build             default: false
}

sitedown(options, function (err) {
  if (err) return console.error(err)
  console.log('success')
})
```

### Layout

All files are wrapped in a `layout.html` file. Markdown content is appended to the first `.markdown-body` element, and the page title (`<title>` in `<head>`) is set to the text of the first `h1` element.

The default layout is:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title></title>
    <link rel="stylesheet" href="https://unpkg.com/style.css">
  </head>
  <body>
    <main class="markdown-body"></main>
  </body>
</html>
```

The default layout comes bundled with [`style.css`](https://css-pkg.github.io/style.css), a classless stylesheet for markdown documents.

### Directory indexes (pretty URLs)

Markdown files (`$f.md`, `$f.markdown`) are lowercased and parsed into `$f/index.html` files. Directory indexes can be disabled with the `pretty: false` option. `README.md` files are always converted to directory indexes (`index.html`).

### Links

Relative links that point to markdown files (`$f.md`, `$f.markdown`) are rewritten as `$f/` to point to their `$f/index.html` equivalent.

### Example

Given a directory like this:

```
- .gitignore
- .travis.yml
- bin.js
- CHANGELOG.md
- CONTRIBUTING.md
- index.js
- LICENSE.md
- package.json
- README.md
+ test/
  - index.js
  + markdown/
    - README.md
```

Sitedown's default options will produce a directory like this:

```
- index.html
+ changelog/
  - index.html
+ contributing/
  - index.html
+ license/
  - index.html
+ test/
  + markdown/
    - index.html
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE.md)
