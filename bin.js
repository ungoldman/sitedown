#!/usr/bin/env node

var sitedown = require('.')
var clopts = require('cliclopts')([
  {
    name: 'build',
    abbr: 'b',
    help: 'path to build directory',
    default: 'build'
  },
  {
    name: 'pretty',
    help: 'use directory indexes for pretty URLs',
    boolean: true,
    default: true
  },
  {
    name: 'layout',
    abbr: 'l',
    help: 'path to layout file'
  },
  {
    name: 'silent',
    abbr: 's',
    help: 'make less noise during build',
    boolean: true
  },
  {
    name: 'watch',
    abbr: 'w',
    help: 'watch a directory or file (experimental)',
    boolean: true
  },
  {
    name: 'version',
    abbr: 'v',
    boolean: true,
    help: 'show version information'
  },
  {
    name: 'help',
    abbr: 'h',
    help: 'show help',
    boolean: true
  }
])
var argv = require('minimist')(process.argv.slice(2), {
  alias: clopts.alias(),
  boolean: clopts.boolean(),
  default: clopts.default()
})

if (argv.version) {
  console.log(require('./package').version)
  process.exit(0)
}

if (argv.help) {
  console.log('Usage: sitedown [source] [options]\n')
  console.log('    Example: sitedown source/ -b build/ -l layout.html\n')
  console.log('    source                path to source directory (default: current working directory)')
  clopts.print()
  process.exit(0)
}

argv.source = argv.source || argv._[0] || '.'
argv.build = argv.build || 'build'
argv.silent = argv.silent || false

function watch () {
  var gaze = require('gaze')
  var path = require('path')
  var source = path.resolve(argv.source)

  gaze('**/*.md', { cwd: source }, function (err, watcher) {
    if (err) console.error(err.message)

    console.log('\nWatching ' + source + ' for changes...')

    watcher.on('all', function (event, filepath) {
      console.log('\n' + filepath + ' was ' + event + '\n')

      sitedown(argv, function (err) {
        if (err) return console.error(err.message)
      })
    })
  })
}

sitedown(argv, function (err) {
  if (err) {
    console.error(err.message)
    process.exit(1)
  } else {
    if (argv.watch) watch()
  }
})
