var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')

test('markdown to html', function (t) {
  var sitedown = require('../')

  var opts = {
    root: path.join(__dirname, 'markdown'),
    output: path.join(__dirname, 'site'),
    silent: true
  }

  rimraf(opts.output, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      if (err) return console.error(err)

      var generatedIndex = path.join(opts.output, 'index.html')
      fs.readFile(generatedIndex, {encoding: 'utf8'}, function (err, data) {
        if (err) t.error(err)
        t.equals(data, '<h1>TESTING!</h1>\n', 'conversion lgtm')
        t.end()
      })
    })
  }
})

test('header & footer concatenation', function (t) {
  var sitedown = require('../')

  var opts = {
    root: path.join(__dirname, 'markdown'),
    header: '<blink>w00t</blink>',
    footer: '<marquee>THE END</marquee>',
    output: path.join(__dirname, 'site'),
    silent: true
  }

  rimraf(opts.output, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      if (err) return console.error(err)

      var generatedIndex = path.join(opts.output, 'index.html')
      fs.readFile(generatedIndex, {encoding: 'utf8'}, function (err, data) {
        if (err) t.error(err)
        t.equals(data, opts.header + '<h1>TESTING!</h1>\n' + opts.footer, 'header, content, & footer are there')
        t.end()
      })
    })
  }
})
