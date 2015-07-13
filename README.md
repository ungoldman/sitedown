# sitedown

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/sitedown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sitedown
[travis-image]: https://img.shields.io/travis/ngoldman/sitedown.svg?style=flat-square
[travis-url]: https://travis-ci.org/ngoldman/sitedown

Generate a static HTML site from a collection of markdown files.

**work in progress**

## Install

```
npm install sitedown -g
```

## Usage

### CLI

```
$ sitedown
```

### Node API

```js
var sitedown = require('sitedown')

var options = {
  root: '.'         // source directory (defaults to cwd)
  header: '',       // path to header partial (defaults to '')
  footer: '',       // path to footer partial (defaults to '')
  output: './site/' // path to output folder  (defaults to 'site' in cwd)
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
