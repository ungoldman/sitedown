const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const readdirp = require('readdirp')
const { mkdirp } = require('mkdirp')
const es = require('event-stream')
const cheerio = require('cheerio')
const markdownIt = require('markdown-it')

const mdOpts = {
  html: true,
  linkify: true,
  typographer: true
}

const markdownItSub = require('markdown-it-sub')
const markdownItSup = require('markdown-it-sup')
const markdownItFootnote = require('markdown-it-footnote')
const markdownItDeflist = require('markdown-it-deflist')
const markdownItEmoji = require('markdown-it-emoji')
const markdownItIns = require('markdown-it-ins')
const markdownItMark = require('markdown-it-mark')
const markdownItAbbr = require('markdown-it-abbr')
const markdownItHighlightjs = require('markdown-it-highlightjs')
const markdownItGithubHeadings = require('markdown-it-github-headings')

const defaultLayout = path.join(__dirname, 'layout.html')
const encoding = { encoding: 'utf8' }

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
  options.assets = options.assets || 'assets'

  if (typeof callback === 'undefined') callback = noop

  if (!fs.existsSync(options.layout)) {
    const error = new Error('layout file not found: ' + options.layout)
    if (callback === noop) throw error
    return callback(error)
  }

  readdirp(options.source, {
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
      generateSite(options, _ => {
        copyAssets(options.assets, options.build)
        callback(null)
      })
    })
}

function copyAssets (source, dest) {
  if (fs.existsSync(source)) {
    spawn('cp', ['-R', '-v', source, dest], { stdio: 'inherit' })
  } else {
    console.log('❌ no assets found, skipping')
  }
}

/**
 * Turns markdown file into HTML.
 *
 * @param  {String} filePath - full path to markdown file
   @param  {Object} options - hljsHighlights, githubHeadings
 * @return {String} - md file converted to html
 */
function mdToHtml (filePath, opts) {
  const body = fs.readFileSync(filePath, encoding)
  if (!opts) opts = {}

  let md = markdownIt(mdOpts)
    .use(markdownItSub)
    .use(markdownItSup)
    .use(markdownItFootnote)
    .use(markdownItDeflist)
    .use(markdownItEmoji)
    .use(markdownItIns)
    .use(markdownItMark)
    .use(markdownItAbbr)
    .use(markdownItHighlightjs, { auto: false, code: !opts.noHljsClass })

  if (opts.githubHeadings) {
    md = md.use(markdownItGithubHeadings, { prefixHeadingIds: false })
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
  const page = cheerio.load(layout)
  const target = el || '.markdown-body'

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

  const regex = /(href=")((?!http[s]*:).*)(\.md|\.markdown)"/g

  return body.replace(regex, function (match, p1, p2, p3) {
    const f = p2.toLowerCase()

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
  const layout = fs.readFileSync(options.layout, encoding)

  options.files.forEach(function (file) {
    const parsedFile = path.parse(file)
    const name = parsedFile.name.toLowerCase()

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

    const dest = path.format(parsedFile)
    const body = rewriteLinks(mdToHtml(path.join(options.source, file), {
      githubHeadings: options.githubHeadings,
      noHljsClass: options.noHljsClass
    }), options.pretty)
    const title = cheerio.load(body)('h1').first().text().trim()
    const html = buildPage(title, body, layout, options.el)

    mkdirp.sync(path.join(options.build, parsedFile.dir))
    fs.writeFileSync(path.join(options.build, dest), html, encoding)
    if (!options.silent) console.log('✅ built', dest)
  })

  if (typeof callback === 'function') callback(null)
}

/**
 * Run sitedown and watch for changes.
 *
 * @param  {Object} options - source, layout, output, silent, files, pretty
 */
function watch (options, callback) {
  const gaze = require('gaze')
  const source = path.resolve(options.source)
  const layout = options.layout ? path.resolve(process.cwd(), options.layout) : defaultLayout

  sitedown(options, function (err) {
    if (err) return console.error(err.message)

    if (typeof callback === 'function') callback(err)

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

function dev (options) {
  sitedown.watch(options, _ => {
    // dirty hack
    const execPath = require.resolve('@ungoldman/serve/bin/serve.js')
    const proc = spawn(execPath, [options.build], { stdio: 'inherit' })

    proc.on('close', code => process.exit(code))
  })
}

sitedown.mdToHtml = mdToHtml
sitedown.buildPage = buildPage
sitedown.rewriteLinks = rewriteLinks
sitedown.generateSite = generateSite
sitedown.watch = watch
sitedown.dev = dev

module.exports = sitedown
