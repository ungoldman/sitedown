var fs = require('fs')
var path = require('path')
var cwp = require('cwp')
var readdirp = require('readdirp')
var mkdirp = require('mkdirp')
var es = require('event-stream')
var cheerio = require('cheerio')
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
 * @param  {Object}   options   source, build, layout, silent
 * @param  {Function} callback
 */
function sitedown (options, callback) {
  options = options || {}
  options.source = options.source || cwp('.')
  options.build = options.build || cwp('build')
  options.layout = options.layout ? path.resolve(process.cwd(), options.layout) : path.join(__dirname, 'layout.html')
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
function mdToHtml (filePath) {
  var body = fs.readFileSync(filePath, encoding)
  return md.render(body)
}

/**
 * Injects title and body into HTML layout.
 * Title goes into `title` element, body goes into `.markdown-body` element.
 * Rewrites relative `$1.md` and `$1.markdown` links in body to `$1/index.html`.
 *
 * @param  {String} title
 * @param  {String} body
 * @param  {String} layout
 * @return {String}
 */
function buildPage (title, body, layout) {
  body = body ? body.replace(/(href="(?!http[s]*\:).*)(\.md|\.markdown)"/g, function () { return arguments[1].toLowerCase() + '/"' }) : ''
  var page = cheerio.load(layout)

  page('title').text(title)
  page('.markdown-body').html(body)

  return page.html()
}

/**
 * Generates site from array of markdown file paths.
 *
 * @param  {Object}   opt       source, layout, output, silent, files
 * @param  {Function} callback
 */
function generateSite (opt, callback) {
  var layout = fs.readFileSync(opt.layout, encoding)

  opt.files.forEach(function (file) {
    var parsedFile = path.parse(file)

    if (parsedFile.name !== 'README') {
      parsedFile.dir = path.join(parsedFile.dir, parsedFile.name.toLowerCase())
    }

    parsedFile.name = 'index'
    parsedFile.base = 'index.html'
    parsedFile.ext = '.html'

    var dest = path.format(parsedFile)
    var body = mdToHtml(path.join(opt.source, file))
    var title = cheerio.load(body)('h1').text()
    var html = buildPage(title, body, layout)

    mkdirp.sync(path.join(opt.build, parsedFile.dir))
    fs.writeFileSync(path.join(opt.build, dest), html, encoding)
    if (!opt.silent) console.log('✓ built', dest)
  })

  callback(null)
}

sitedown.mdToHtml = mdToHtml
sitedown.buildPage = buildPage
sitedown.generateSite = generateSite

module.exports = sitedown
