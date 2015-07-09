# sitedown

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/sitedown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/sitedown
[travis-image]: https://img.shields.io/travis/ngoldman/sitedown.svg?style=flat-square
[travis-url]: https://travis-ci.org/ngoldman/sitedown

Generate a site from a collection of markdown files.

**work in progress**

## Install

```
npm install sitedown
```

## Usage

```js
var sitedown = require('sitedown')

var options = {
  source: '.',                      // source directory
  header: './partials/header.html', // path to header partial
  footer: './partials/footer.html', // path to footer partial
  output: './sitedown/'             // path to output folder
}

sitedown(options, function (err) {
  if (err) return console.error(err)
  console.log('✓ success')
})
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE.md)
