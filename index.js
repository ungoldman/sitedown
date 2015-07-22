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

/**
 * Generate a static HTML site from a collection of markdown files.
 *
 * @param  {Object}   options  root, header, footer, output, silent
 * @param  {Function} callback
 */
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
      console.error('warning', err)
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
      parsedFile.ext = '.html'

      var dest = path.format(parsedFile)
      var pageBody = fileToPageBody(path.join(root, file))
      var html = buildPage(header, pageBody, footer)

      mkdirp.sync(path.join(output, parsedFile.dir))

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
 * Turns markdown file into HTML.
 *
 * @param  {String}  filePath full path to markdown file
 * @return {String}           md file converted to html
 */
function fileToPageBody (filePath) {
  var body = fs.readFileSync(filePath, encoding)
  return md.render(body)
}

/**
 * Glues together HTML header, body, and footer.
 * Rewrites `.md` & `.markdown` links in body to `.html`.
 *
 * @param  {String} header HTML partial
 * @param  {String} body   HTML partial
 * @param  {String} footer HTML partial
 * @return {String}
 */
function buildPage (header, body, footer) {
  header = header || ''
  body = body ? body.replace(/(\.md|\.markdown)"/g, '.html"') : ''
  footer = footer || ''

  return header + body + footer
}

module.exports = sitedown
