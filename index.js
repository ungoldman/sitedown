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
md.use(require('markdown-it-highlightjs'))

var encoding = { encoding: 'utf8' }

function noop () {}

/**
 * Generate a static HTML site from a collection of markdown files.
 *
 * @param  {Object}   options  source, build, header, footer, silent
 * @param  {Function} callback
 */
function sitedown (options, callback) {
  options = options || {}
  options.source = options.source || cwp('.')
  options.build = options.build || cwp('./build/')
  options.files = []

  if (typeof callback === 'undefined') callback = noop

  readdirp({
    root: options.source,
    fileFilter: ['*.md', '*.markdown'],
    directoryFilter: ['!.git', '!node_modules', '!' + options.build]
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
      options.files.push(file)
    })
    .on('end', function () {
      generateSite(options, callback)
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
  body = body ? body.replace(/(href="(?!http[s]*\:).*)(\.md|\.markdown)"/g, '$1.html"') : ''
  footer = footer || ''

  return header + body + footer
}

/**
 * Generates site from array of markdown file paths.
 *
 * @param  {Object}   opt      root, header, footer, output, silent, files
 * @param  {Function} callback
 */
function generateSite (opt, callback) {
  var header = ''
  var footer = ''
  if (opt.header) header = fs.readFileSync(opt.header, encoding)
  if (opt.footer) footer = fs.readFileSync(opt.footer, encoding)

  opt.files.forEach(function (file) {
    var parsedFile = path.parse(file)

    if (parsedFile.name === 'README') parsedFile.name = 'index'

    parsedFile.base = parsedFile.name + '.html'
    parsedFile.ext = '.html'

    var dest = path.format(parsedFile)
    var pageBody = fileToPageBody(path.join(opt.source, file))
    var html = buildPage(header, pageBody, footer)

    mkdirp.sync(path.join(opt.build, parsedFile.dir))

    fs.writeFileSync(path.join(opt.build, dest), html, encoding)

    if (!opt.silent) console.log('✓ built', dest)
  })

  callback(null)
}

sitedown.fileToPageBody = fileToPageBody
sitedown.buildPage = buildPage
sitedown.generateSite = generateSite

module.exports = sitedown
