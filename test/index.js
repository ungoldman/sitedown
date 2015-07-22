var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var sitedown = require('../')
var enc = { encoding: 'utf8' }
var generatedRewrite = '<p><a href="rewrite.html">rewrite me</a></p>\n'

test('markdown to html', function (t) {
  var file = path.join(__dirname, 'markdown', 'README.md')
  var html = sitedown.fileToPageBody(file)
  t.equals(html, '<h1>TESTING!</h1>\n', 'conversion lgtm')
  t.end()
})

test('header & footer concatenation', function (t) {
  var file = path.join(__dirname, 'markdown', 'README.md')
  var body = sitedown.fileToPageBody(file)
  var header = '<blink>w00t</blink>'
  var footer = '<marquee>THE END</marquee>'
  var html = sitedown.buildPage(header, body, footer)
  t.equals(html, header + '<h1>TESTING!</h1>\n' + footer, 'header, content, & footer are there')
  t.end()
})

test('rewrite markdown links', function (t) {
  var file = path.join(__dirname, 'markdown', 'rewrite.md')
  var body = sitedown.fileToPageBody(file)
  var html = sitedown.buildPage('', body, '')
  t.equals(html, generatedRewrite, 'markdown link got rewritten')
  t.end()
})

test('site generation', function (t) {
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
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.output, 'index.html'), enc)
      var rewrite = fs.readFileSync(path.join(opts.output, 'rewrite.html'), enc)
      var nested = fs.readFileSync(path.join(opts.output, 'nested', 'test.html'), enc)

      var nestedFile = path.join(__dirname, 'markdown', 'nested', 'test.md')
      var nestedHtml = sitedown.fileToPageBody(nestedFile)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, opts.header + '<h1>TESTING!</h1>\n' + opts.footer, 'concatenation working')

      t.ok(rewrite, 'generated link rewrite file exists')
      t.equals(rewrite, opts.header + generatedRewrite + opts.footer, 'rewrite file looks okay')

      t.ok(nested, 'generated nested file exists')
      t.equals(nested, opts.header + nestedHtml + opts.footer, 'rewrite file looks okay')

      rimraf(opts.output, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})
