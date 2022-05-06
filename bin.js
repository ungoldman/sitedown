#!/usr/bin/env node

const sitedown = require('.')
const clopts = require('cliclopts')([
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
    name: 'el',
    abbr: 'e',
    help: 'css selector for target element',
    default: '.markdown-body'
  },
  {
    name: 'layout',
    abbr: 'l',
    help: 'path to layout file'
  },
  {
    name: 'github-headings',
    abbr: 'g',
    alias: 'githubHeadings',
    help: 'add anchors to headings just like GitHub',
    boolean: true,
    default: false
  },
  {
    name: 'no-hljs-class',
    alias: 'noHljsClass',
    help: 'don\'t add the hljs class to codeblocks',
    boolean: true,
    default: false
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
    name: 'dev',
    abbr: 'd',
    help: 'start development server (experimental)',
    default: false
  },
  {
    name: 'assets',
    abbr: 'a',
    help: 'assets folder to copy',
    default: 'assets'
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
const argv = require('minimist')(process.argv.slice(2), {
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
  console.log('    Example: sitedown . -b dist -l layout.html\n')
  console.log('    source                path to source directory (default: current working directory)')
  clopts.print()
  process.exit(0)
}

argv.source = argv.source || argv._[0] || '.'
argv.build = argv.build || 'build'
argv.silent = argv.silent || false

if (argv.dev) {
  sitedown.dev(argv)
} else if (argv.watch) {
  sitedown.watch(argv)
} else {
  sitedown(argv, function (err) {
    if (err) {
      console.error(err.message)
      process.exit(1)
    } else {
      process.exit(0)
    }
  })
}
