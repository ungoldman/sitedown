var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var sitedown = require('../')
var enc = { encoding: 'utf8' }
var header = '<blink>w00t</blink>'
var footer = '<marquee>THE END</marquee>'
var generatedIndex = '<h1>TESTING!</h1>\n'
var generatedRewrite = '<p><a href="rewrite.html">rewrite me</a></p>\n'

test('markdown to html', function (t) {
  var file = path.join(__dirname, 'markdown', 'README.md')
  var html = sitedown.fileToPageBody(file)
  t.equals(html, generatedIndex, 'conversion lgtm')
  t.end()
})

test('header & footer concatenation', function (t) {
  var file = path.join(__dirname, 'markdown', 'README.md')
  var body = sitedown.fileToPageBody(file)
  var html = sitedown.buildPage(header, body, footer)
  t.equals(html, header + generatedIndex + footer, 'header, content, & footer are there')
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
    source: path.join(__dirname, 'markdown'),
    build: path.join(__dirname, 'build'),
    header: path.join(__dirname, 'partials', '_header.html'),
    footer: path.join(__dirname, 'partials', '_footer.html'),
    silent: false
  }

  rimraf(opts.build, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.build, 'index.html'), enc)
      var rewrite = fs.readFileSync(path.join(opts.build, 'rewrite.html'), enc)
      var nested = fs.readFileSync(path.join(opts.build, 'nested', 'test.html'), enc)

      var nestedFile = path.join(__dirname, 'markdown', 'nested', 'test.md')
      var nestedHtml = sitedown.fileToPageBody(nestedFile)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, header + generatedIndex + footer, 'concatenation working')

      t.ok(rewrite, 'generated link rewrite file exists')
      t.equals(rewrite, opts.header + generatedRewrite + opts.footer, 'rewrite file looks okay')

      t.ok(nested, 'generated nested file exists')
      t.equals(nested, opts.header + nestedHtml + opts.footer, 'rewrite file looks okay')

      rimraf(opts.build, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})
