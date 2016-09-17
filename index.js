var fs = require('fs')
var path = require('path')
var cwp = require('cwp')
var readdirp = require('readdirp')
var mkdirp = require('mkdirp')
var es = require('event-stream')
var cheerio = require('cheerio')
var hljs = require('highlight.js')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (e) {}
    }
    return '' // use external default escaping
  }
})
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-abbr'))

var defaultLayout = path.join(__dirname, 'layout.html')
var encoding = { encoding: 'utf8' }

function noop () {}

/**
 * Generate a static HTML site from a collection of markdown files.
 *
 * @param  {Object}   options   source, build, layout, silent
 * @param  {Function} callback
 */
function sitedown (options, callback) {
  options = options || {}
  options.source = options.source || cwp('.')
  options.build = options.build || cwp('build')
  options.layout = options.layout ? path.resolve(process.cwd(), options.layout) : defaultLayout
  // pretty defaults to true unless explicitly set to false
  options.pretty = options.pretty !== false
  options.files = []

  if (typeof callback === 'undefined') callback = noop

  if (!fs.existsSync(options.layout)) {
    var error = new Error('layout file not found: ' + options.layout)
    if (callback === noop) throw error
    return callback(error)
  }

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
function mdToHtml (filePath) {
  var body = fs.readFileSync(filePath, encoding)
  return md.render(body)
}

/**
 * Injects title and body into HTML layout.
 * Title goes into `title` element, body goes into `.markdown-body` element.
 *
 * @param  {String} title
 * @param  {String} body
 * @param  {String} layout
 * @return {String}
 */
function buildPage (title, body, layout) {
  var page = cheerio.load(layout)

  page('title').text(title)
  page('.markdown-body').append(body)

  return page.html()
}

/**
  * Rewrites relative `$1.md` and `$1.markdown` links in body to `$1/index.html`.
  * If pretty is false, rewrites `$1.md` to `$1.html`.
  * `readme.md` is always rewritten to `index.html`.
  *
  * @param  {String} body
  * @param  {Boolean} pretty
  * @return {String}
  */
function rewriteLinks (body, pretty) {
  body = body || ''

  if (pretty !== false) pretty = true // default to true if omitted

  var regex = /(href=")((?!http[s]*:).*)(\.md|\.markdown)"/g

  return body.replace(regex, function (match, p1, p2, p3) {
    var f = p2.toLowerCase()

    if (f === 'readme') return p1 + '/"'
    if (pretty) return p1 + f + '/"'
    return p1 + f + '.html"'
  })
}

/**
 * Generates site from array of markdown file paths.
 *
 * @param  {Object}   opt       source, layout, output, silent, files, pretty
 * @param  {Function} callback
 */
function generateSite (opt, callback) {
  var layout = fs.readFileSync(opt.layout, encoding)

  opt.files.forEach(function (file) {
    var parsedFile = path.parse(file)
    var name = parsedFile.name.toLowerCase()

    parsedFile.ext = '.html'

    if (name === 'readme') {
      parsedFile.name = 'index'
      parsedFile.base = 'index.html'
    } else {
      if (opt.pretty) {
        parsedFile.name = 'index'
        parsedFile.base = 'index.html'
        parsedFile.dir = path.join(parsedFile.dir, name)
      } else {
        parsedFile.name = name
        parsedFile.base = name + '.html'
      }
    }

    var dest = path.format(parsedFile)
    var body = rewriteLinks(mdToHtml(path.join(opt.source, file)), opt.pretty)
    var title = cheerio.load(body)('h1').first().text().trim()
    var html = buildPage(title, body, layout)

    mkdirp.sync(path.join(opt.build, parsedFile.dir))
    fs.writeFileSync(path.join(opt.build, dest), html, encoding)
    if (!opt.silent) console.log('✓ built', dest)
  })

  callback(null)
}

sitedown.mdToHtml = mdToHtml
sitedown.buildPage = buildPage
sitedown.rewriteLinks = rewriteLinks
sitedown.generateSite = generateSite

module.exports = sitedown
