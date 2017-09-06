var fs = require('fs')
var path = require('path')
var readdirp = require('readdirp')
var mkdirp = require('mkdirp')
var es = require('event-stream')
var cheerio = require('cheerio')
var hljs = require('highlight.js')
var markdownIt = require('markdown-it')

var mdOpts = {
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
}

var markdownItSub = require('markdown-it-sub')
var markdownItSup = require('markdown-it-sup')
var markdownItFootnote = require('markdown-it-footnote')
var markdownItDeflist = require('markdown-it-deflist')
var markdownItEmoji = require('markdown-it-emoji')
var markdownItIns = require('markdown-it-ins')
var markdownItMark = require('markdown-it-mark')
var markdownItAbbr = require('markdown-it-abbr')
var markdownItGithubHeadings = require('markdown-it-github-headings')

var defaultLayout = path.join(__dirname, 'layout.html')
var encoding = { encoding: 'utf8' }

function noop () {}

/**
 * Generate a static HTML site from a collection of markdown files.
 *
 * @param  {Object}   options - source, build, layout, silent
 * @param  {Function} callback
 */
function sitedown (options, callback) {
  options = options || {}
  options.source = options.source || path.resolve('.')
  options.build = options.build || path.resolve('build')
  options.layout = options.layout ? path.resolve(process.cwd(), options.layout) : defaultLayout
  // pretty defaults to true unless explicitly set to false
  options.pretty = options.pretty !== false
  options.el = options.el || '.markdown-body'
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
 * @param  {String} filePath - full path to markdown file
 * @param  {Boolean} githubHeadings - use GitHub style heading anchors
 * @return {String} - md file converted to html
 */
function mdToHtml (filePath, githubHeadings) {
  var body = fs.readFileSync(filePath, encoding)

  var md = markdownIt(mdOpts)
    .use(markdownItSub)
    .use(markdownItSup)
    .use(markdownItFootnote)
    .use(markdownItDeflist)
    .use(markdownItEmoji)
    .use(markdownItIns)
    .use(markdownItMark)
    .use(markdownItAbbr)

  if (githubHeadings) {
    md = md.use(markdownItGithubHeadings, {prefixHeadingIds: false})
  }

  // disable autolinking for filenames
  md.linkify.tlds('.md', false) // markdown

  return md.render(body)
}

/**
 * Injects title and body into HTML layout.
 * Title goes into `title` element, body goes into `.markdown-body` element.
 *
 * @param  {String} title - page title
 * @param  {String} body - html content to inject into target
 * @param  {String} layout - html layout file
 * @param  {String?} el - CSS selector for target element
 * @return {String}
 */
function buildPage (title, body, layout, el) {
  var page = cheerio.load(layout)
  var target = el || '.markdown-body'

  page('title').text(title)
  page(target).append(body)

  return page.html()
}

/**
  * Rewrites relative `$1.md` and `$1.markdown` links in body to `$1/index.html`.
  * If pretty is false, rewrites `$1.md` to `$1.html`.
  * `readme.md` is always rewritten to `index.html`.
  *
  * @param  {String} body - html content to rewrite
  * @param  {Boolean} pretty - rewrite links for pretty URLs (directory indexes)
  * @return {String}
  */
function rewriteLinks (body, pretty) {
  body = body || ''

  if (pretty !== false) pretty = true // default to true if omitted

  var regex = /(href=")((?!http[s]*:).*)(\.md|\.markdown)"/g

  return body.replace(regex, function (match, p1, p2, p3) {
    var f = p2.toLowerCase()

    // root readme
    if (f === 'readme') return p1 + '/"'

    // nested readme
    if (f.match(/readme$/)) return p1 + f.replace(/readme$/, '') + '"'

    // pretty url
    if (pretty) return p1 + f + '/"'

    // default
    return p1 + f + '.html"'
  })
}

/**
 * Generates site from array of markdown file paths.
 *
 * @param {Object} options - source, layout, output, silent, files, pretty, el, githubHeadings
 * @param {Function} callback
 */
function generateSite (options, callback) {
  var layout = fs.readFileSync(options.layout, encoding)

  options.files.forEach(function (file) {
    var parsedFile = path.parse(file)
    var name = parsedFile.name.toLowerCase()

    parsedFile.ext = '.html'

    if (name === 'readme') {
      parsedFile.name = 'index'
      parsedFile.base = 'index.html'
    } else {
      if (options.pretty) {
        parsedFile.name = 'index'
        parsedFile.base = 'index.html'
        parsedFile.dir = path.join(parsedFile.dir, name)
      } else {
        parsedFile.name = name
        parsedFile.base = name + '.html'
      }
    }

    var dest = path.format(parsedFile)
    var body = rewriteLinks(mdToHtml(path.join(options.source, file), options.githubHeadings), options.pretty)
    var title = cheerio.load(body)('h1').first().text().trim()
    var html = buildPage(title, body, layout, options.el)

    mkdirp.sync(path.join(options.build, parsedFile.dir))
    fs.writeFileSync(path.join(options.build, dest), html, encoding)
    if (!options.silent) console.log('✓ built', dest)
  })

  callback(null)
}

/**
 * Run sitedown and watch for changes.
 *
 * @param  {Object} options - source, layout, output, silent, files, pretty
 */
function watch (options) {
  var gaze = require('gaze')
  var source = path.resolve(options.source)
  var layout = options.layout ? path.resolve(process.cwd(), options.layout) : defaultLayout

  sitedown(options, function (err) {
    if (err) return console.error(err.message)

    gaze(['**/*.md', layout], { cwd: source }, function (err, watcher) {
      if (err) console.error(err.message)

      console.log('\nWatching ' + source + ' for changes...')

      watcher.on('all', function (event, filepath) {
        console.log('\n' + filepath + ' was ' + event + '\n')

        sitedown(options, function (err) {
          if (err) return console.error(err.message)
        })
      })
    })
  })
}

sitedown.mdToHtml = mdToHtml
sitedown.buildPage = buildPage
sitedown.rewriteLinks = rewriteLinks
sitedown.generateSite = generateSite
sitedown.watch = watch

module.exports = sitedown
