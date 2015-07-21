var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')

test('Example Test', function (t) {
  var sitedown = require('../')

  var opts = {
    root: path.join(__dirname, 'markdown'),
    header: '<blink>w00t</blink>',
    footer: '<marquee>THE END</marquee>',
    output: path.join(__dirname, 'site')
  }

  rimraf(opts.output, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      if (err) return console.error(err)

      var generatedIndex = path.join(opts.output, 'index.html')
      fs.readFile(generatedIndex, {encoding: 'utf8'}, function (err, data) {
        if (err) t.errir(err)
        t.equals(data, opts.header + '<h1>TESTING!</h1>\n' + opts.footer)
      })
      t.end()
    })
  }
})
