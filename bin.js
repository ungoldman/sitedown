#!/usr/bin/env node

var sitedown = require('.')

sitedown({
  source: '.', // source directory
  header: __dirname + '/partials/header.html', // path to header partial
  footer: __dirname + '/partials/footer.html', // path to footer partial
  output: './sitedown/' // path to output folder
}, function (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('✓ success')
})
