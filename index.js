var fs = require('fs')
var path = require('path')
var cwp = require('cwp')
var readdirp = require('readdirp')
var mkdirp = require('mkdirp')
var es = require('event-stream')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
})
var encoding = { encoding: 'utf8' }

function noop () {}

function sitedown (options, callback) {
  options = options || {}
  var root = options.root || cwp('.')
  var header = options.header || ''
  var footer = options.footer || ''
  var output = options.output || cwp('./site/')

  if (typeof callback === 'undefined') callback = noop

  readdirp({
    root: root,
    fileFilter: ['*.md', '*.markdown'],
    directoryFilter: ['!.git', '!node_modules']
  })
    .on('warn', function (err) {
      console.error('non-fatal error', err)
    })
    .on('error', function (err) {
      callback(err)
    })
    .pipe(es.mapSync(function (entry) {
      return entry.path
    }))
    .on('data', function (file) {
      var parsedFile = path.parse(file)
      if (parsedFile.name === 'README') parsedFile.name = 'index'
      parsedFile.base = parsedFile.name + '.html'

      var dest = path.format(parsedFile)

      var pageBody = fileToPageBody(path.join(root, file))
      var html = buildPage(header, pageBody, footer)

      mkdirp.sync(output)

      fs.writeFile(path.join(output, dest), html, encoding, function (err) {
        if (err) return console.error(err)
        if (options.silent) console.log('built', dest)
      })
    })
    .on('end', function () {
      callback(null, true)
    })
}

/**
 * turns markdown file into html
 * @param  {String}  filePath   full path to markdown file
 * @return {Object}             html
 */
function fileToPageBody (filePath) {
  var body = fs.readFileSync(filePath, encoding)
  return md.render(body)
}

/**
 * glues together html header, body, and footer
 * also rewrites markdown links to html links
 */
function buildPage (header, body, footer) {
  header = header || ''
  body = body ? body.replace(/(\.md|\.markdown)"/g, '.html"') : ''
  footer = footer || ''

  return header + body + footer
}

module.exports = sitedown
