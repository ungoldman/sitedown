# sitedown

> Generate a static HTML site from a collection of markdown files.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/sitedown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sitedown
[travis-image]: https://img.shields.io/travis/ngoldman/sitedown.svg?style=flat-square
[travis-url]: https://travis-ci.org/ngoldman/sitedown

**work in progress**

## Install

```
npm install sitedown
```

## Usage

Given a directory like this:

```
.
├── .gitignore
├── .travis.yml
├── bin.js
├── CHANGELOG.md
├── CONTRIBUTING.md
├── index.js
├── LICENSE.md
├── package.json
├── README.md
└── test/
  ├── index.js
  └── markdown/
    └── README.md
```

This program will produce a directory like this:

```
.
├── CHANGELOG.html
├── CONTRIBUTING.html
├── index.html
├── LICENSE.html
└── test/
  └── markdown/
    └── index.html
```

`README.md` files are turned into indexes (`index.html`) and links that point to markdown files (`.md`, `.markdown`) are rewritten to point to their `.html` equivalent.

### CLI

```
$ sitedown --help
Usage: sitedown [source] [options]

    Example: sitedown source_dir --build build_dir

    [source]              path to source directory (default: current working directory)
    --build, -b           path to build directory (default: "build" in current working directory)
    --header              path to header file
    --footer              path to footer file
    --version, -v         show version information
    --help, -h            show help
```

### Node API

```js
var sitedown = require('sitedown')

var options = {
  source: '.',                        // path to source directory       default: cwd
  build: './build/',                  // path to build directory        default: 'build' in cwd
  header: './partials/header.html',   // path to header partial         default: none
  footer: './partials/footer.html',   // path to footer partial         default: none
  silent: false                       // make less noise during build   default: false
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
