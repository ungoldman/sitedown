var fs = require('fs')
var cwp = require('cwp')
var glob = require('glob')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
})
var encoding = { encoding: 'utf8' }
var ignore = ['node_modules']

function sitedown (options, callback) {

  gatherFiles(options.source, function (err, files) {
    if (err) return callback(err)

    var filesOpts = {
      files: files,
      ignore: options.ignore || ignore
    }

    parseFiles(filesOpts, function (err, pages) {
      if (err) return callback(err)

      var pagesOpts = {
        pages: pages,
        header: options.header,
        footer: options.footer,
        output: options.output
      }

      buildPages(pagesOpts, function (err) {
        if (err) return callback(err)

        callback(null)
      })
    })
  })
}

function gatherFiles (pattern, callback) {
  glob(pattern, function (err, files) {
    if (err) return callback(err)
    if (callback) callback(null, files)
  })
}

function parseFiles (options, callback) {
  var pages = []

  options.files.forEach(function (file) {
    // exclude any files that match a pattern from ignore
    for (var j = 0; j < options.ignore.length; j++) {
      if (file.match(options.ignore[j]) !== null) return
    }

    var path = file.split('/').slice(0, -1).join('/')
    var name = file.split('.')[0].split('/').pop()

    // treat README as directory index
    if (name === 'README') name = 'index'

    console.log(file, path, name)

    // add page object to pages array
    pages.push({
      path: path + '/' + name + '.html',
      body: md.render(fs.readFileSync(cwp('./' + file), encoding))
    })
  })

  if (callback) callback(null, pages)
}

function buildPages (options, callback) {

  options.pages.forEach(function (page) {
    var header = fs.readFileSync(cwp(options.header), encoding)
    var footer = fs.readFileSync(cwp(options.footer), encoding)

    // rewrite all relative links to markdown files to point to html equivalents
    var content = page.body.replace(/\.md"/g, '.html"')

    var output = options.output
    if (output[output.length - 1] !== '/' &&
        page.path[0] !== '/') output += '/'
    output += page.path

    // stitch together header, content, and footer
    fs.writeFile(cwp(output), header + content + footer, function (err) {
      if (err) return console.error(err)
      console.log('built', output)
    })
  })

  callback(null, true)
}

module.exports = sitedown
