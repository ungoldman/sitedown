#!/usr/bin/env node

var sitedown = require('.')
var clopts = require('cliclopts')([
  {
    name: 'build',
    abbr: 'b',
    help: 'path to build directory (default: "build" in current working directory)'
  },
  {
    name: 'header',
    help: 'path to header file'
  },
  {
    name: 'footer',
    help: 'path to footer file'
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
  console.log('    Example: sitedown source_dir --build build_dir\n')
  console.log('    [source]              path to source directory (default: current working directory)')
  clopts.print()
  process.exit(0)
}

if (argv._[0]) argv.source = argv._[0]

sitedown(argv)
