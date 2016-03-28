# sitedown

> Generate a static HTML site from a collection of markdown files.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/sitedown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sitedown
[travis-image]: https://img.shields.io/travis/ungoldman/sitedown.svg?style=flat-square
[travis-url]: https://travis-ci.org/ungoldman/sitedown

## Install

```
npm install sitedown
```

## Usage

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

This program will produce a directory like this:

```
- index.html
+ changelog
  - index.html
+ contributing
  - index.html
+ license
  - index.html
+ test/
  + markdown/
    - index.html
```

- markdown files (`$f.md`, `$f.markdown`) are parsed into `$f/index.html` files
- `README.md` files are converted to directory indexes (`index.html`)
- relative links that point to markdown files (`$f.md`, `$f.markdown`) are rewritten as `$f/` to point to their `$f/index.html` equivalent.

All files can be wrapped in an optional `layout.html` file. Markdown content is injected into the first `.markdown-body` element, and the text of the first `h1` is injected into `title`.

The default layout is:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  <div class="markdown-body"></div>
</body>
</html>
```

### CLI

```
$ sitedown --help
Usage: sitedown [source] [options]

    Example: sitedown source/ -b build/ -l layout.html

    [source]              path to source directory (default: current working directory)
    -b --build            path to build directory (default: "build" in current working directory)
    -l --layout           path to layout file
    -v, --version         show version information
    -h, --help            show help
```

### Node API

```js
var sitedown = require('sitedown')

var options = {
  source: '.',            // path to source directory       default: cwd
  build: 'build',         // path to build directory        default: 'build' in cwd
  layout: 'layout.html',  // path to layout                 default: none
  silent: false           // make less noise during build   default: false
}

sitedown(options, function (err) {
  if (err) return console.error(err)
  console.log('success')
})
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE.md)
