var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var test = require('tape')
var sitedown = require('../')
var enc = { encoding: 'utf8' }
var layout = '<title></title><main class="markdown-body"></main>'
var customElementLayout = '<title></title><main class="i-love-spiderman"></main>'

test('markdown to html', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'README.md')
  var html = sitedown.mdToHtml(file)
  t.equals(html, generatedIndexLgtm, 'conversion lgtm')
  t.end()
})

test('markdown to html with heading anchors IDs', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'README.md')
  var html = sitedown.mdToHtml(file, true)
  t.equals(html, generatedIndexLgtmWithAnchors, 'conversion lgtm')
  t.end()
})

test('injecting body into layout', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'README.md')
  var body = sitedown.mdToHtml(file)
  var html = sitedown.buildPage('w00t', body, layout)
  t.equals(html, '<title>w00t</title><main class="markdown-body">' + generatedIndex + '</main>', 'header, content, & footer are there')
  t.end()
})

test('injecting body into layout w/ custom element', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'README.md')
  var body = sitedown.mdToHtml(file)
  var html = sitedown.buildPage('w00t', body, customElementLayout, '.i-love-spiderman')
  t.equals(html, '<title>w00t</title><main class="i-love-spiderman">' + generatedIndex + '</main>', 'header, content, & footer are there')
  t.end()
})

test('rewrite markdown links', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'rewrite.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file))
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedRewrite, 'markdown link got rewritten')
  t.end()
})

test('rewrite markdown links - readme', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'rewritereadme.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file))
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedRewriteReadme, 'markdown link got rewritten')
  t.end()
})

test('rewrite markdown links - pretty: false', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'rewrite.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file), false)
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedUglyRewrite, 'markdown link got rewritten')
  t.end()
})

test('rewrite markdown links starting named http', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'rewritehttpfoo.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file))
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedRewriteHttpfooMd, 'markdown link httpfoo.md got rewritten')
  t.end()
})

test('do not rewrite https links to md', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'norewritehttps.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file))
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedNoRewriteHttps, 'https hyperlink did not get rewritten')
  t.end()
})

test('do not rewrite http links to md', function (t) {
  var file = path.join(__dirname, 'fixtures', 'md', 'norewritehttp.md')
  var body = sitedown.rewriteLinks(sitedown.mdToHtml(file))
  var html = sitedown.buildPage('', body, layout)
  t.equals(html, generatedNoRewriteHttp, 'http hyperlink did not get rewritten')
  t.end()
})

test('site generation', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    layout: path.resolve(__dirname, '..', 'layout.html'),
    silent: true
  }

  rimraf(opts.build, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.build, 'index.html'), enc)
      var rewrite = fs.readFileSync(path.join(opts.build, 'rewrite', 'index.html'), enc)
      var nested = fs.readFileSync(path.join(opts.build, 'nested', 'test', 'index.html'), enc)
      var multititle = fs.readFileSync(path.join(opts.build, 'multititle', 'index.html'), enc)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, indexContent, 'concatenation working')

      t.ok(rewrite, 'generated link rewrite file exists')
      t.equals(rewrite, rewriteContent, 'rewrite file looks okay')

      t.ok(nested, 'generated nested file exists')
      t.equals(nested, nestedContent, 'generated nested file looks okay')

      t.ok(multititle, 'generated multititle file exists')
      t.equals(multititle, multititleContent, 'generated multititle file looks okay')

      rimraf(opts.build, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})

test('site generation - callback with error if options.layout file does not exist', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    layout: 'nope',
    silent: true
  }

  sitedown(opts, function (err) {
    t.ok(err.message.match('layout file not found'), 'callback with error when layout is not found')
    t.end()
  })
})

test('site generation - throws error if options.layout file does not exist and no callback passed', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    layout: 'nope',
    silent: true
  }

  sitedown(opts, function (err) {
    t.ok(err.message.match('layout file not found'), 'throws an error when layout is not found')
    t.end()
  })
})

test('site generation - no directory indexes (pretty: false)', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    layout: path.resolve(__dirname, '..', 'layout.html'),
    silent: true,
    pretty: false
  }

  rimraf(opts.build, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.build, 'index.html'), enc)
      var rewrite = fs.readFileSync(path.join(opts.build, 'rewrite.html'), enc)
      var nested = fs.readFileSync(path.join(opts.build, 'nested', 'test.html'), enc)
      var multititle = fs.readFileSync(path.join(opts.build, 'multititle.html'), enc)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, indexContent, 'concatenation working')

      t.ok(rewrite, 'generated link rewrite file exists')
      t.equals(rewrite, rewriteUglyContent, 'rewrite file looks okay')

      t.ok(nested, 'generated nested file exists')
      t.equals(nested, nestedContent, 'generated nested file looks okay')

      t.ok(multititle, 'generated multititle file exists')
      t.equals(multititle, multititleContent, 'generated multititle file looks okay')

      rimraf(opts.build, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})

test('site generation - custom element', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    layout: path.resolve(__dirname, 'fixtures', 'html', 'custom-element.html'),
    silent: true,
    pretty: false,
    el: '.custom-element'
  }

  rimraf(opts.build, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.build, 'index.html'), enc)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, customElementContent, 'produced expected output')

      rimraf(opts.build, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})

test('site generation - prefix heading IDs and add anchor links', function (t) {
  var opts = {
    source: path.join(__dirname, 'fixtures', 'md'),
    build: path.join(__dirname, 'build'),
    silent: true,
    pretty: false,
    githubHeadings: true
  }

  rimraf(opts.build, generateSite)

  function generateSite () {
    sitedown(opts, function (err) {
      t.error(err, 'ran without errors')

      var index = fs.readFileSync(path.join(opts.build, 'index.html'), enc)

      t.ok(index, 'README.md converted to index.html')
      t.equals(index, indexContentWithPrefixAndAnchors, 'produced expected output')

      rimraf(opts.build, function (err) {
        t.error(err, 'cleanup')
        t.end()
      })
    })
  }
})

var generatedIndexLgtm = '<h1>TESTING!</h1>\n'
var generatedIndexLgtmWithAnchors = '<h1><a id="testing" class="anchor" href="#testing" aria-hidden="true"><svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>TESTING!</h1>\n'

var generatedIndex = '<h1>TESTING!</h1>\n'
var generatedRewrite = '<title></title><main class="markdown-body"><p><a href="rewrite/">rewrite me</a></p>\n</main>'
var generatedRewriteReadme = '<title></title><main class="markdown-body"><p><a href="/">rewrite me right</a></p>\n</main>'
var generatedUglyRewrite = '<title></title><main class="markdown-body"><p><a href="rewrite.html">rewrite me</a></p>\n</main>'
var generatedNoRewriteHttps = '<title></title><main class="markdown-body"><p><a href="https://github.com/hypermodules/sitedown/README.md">but not me!</a></p>\n</main>'
var generatedNoRewriteHttp = '<title></title><main class="markdown-body"><p><a href="http://github.com/hypermodules/sitedown/README.md">or me!</a></p>\n</main>'
var generatedRewriteHttpfooMd = '<title></title><main class="markdown-body"><p><a href="httpfoo/">rewrite</a></p>\n</main>'
var indexContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>TESTING!</title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><h1>TESTING!</h1>\n</main>\n</body>\n</html>\n'

var coolSvgLinkIcon = '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"/></svg>'
var indexContentWithPrefixAndAnchors = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>TESTING!</title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><h1><a id="testing" class="anchor" href="#testing" aria-hidden="true">' + coolSvgLinkIcon + '</a>TESTING!</h1>\n</main>\n</body>\n</html>\n'

var customElementContent = '<html><title>TESTING!</title><body class="custom-element"><h1>TESTING!</h1>\n</body></html>\n'
var rewriteContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title></title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><p><a href="rewrite/">rewrite me</a></p>\n</main>\n</body>\n</html>\n'
var rewriteUglyContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title></title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><p><a href="rewrite.html">rewrite me</a></p>\n</main>\n</body>\n</html>\n'
var nestedContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Style Guide</title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><h1>Style Guide</h1>\n<h1>Article Title</h1>\n<p><strong>Article content</strong> led to <em>negative</em> values. In primates decreased the objects discovered during the lossless join property <code>(Fi)+ =</code> that is not. Recollapse. The knowledge of recent cosmological models. And methods on another system in the associated with the principle of <a href="#fake-link">Horn-clause</a> logic programming in universes that. If based are reviewed. And trial preparedness is a cosmological models the data collected from conventional analyses and the transition from F is all. At z=0 46&#xB1;0 13. <code>&quot;code quote test&quot;</code> The resulting system on which.</p>\n<p><img src="http://38.media.tumblr.com/tumblr_mdo6z0KBpf1rwy00jo1_400.gif" alt="One note is all that is needed."></p>\n<blockquote>\n<p>Despite double-blind randomized controlled clinical trials choosing an efficacy measure and that. <code>Xi &#x2282; U</code> and interpreting these. New rules intuitionistically (<code>(&apos;single quotes too&apos;)</code>) in particular networks of natural selection on body size. And human cost in spatially homogeneous spacetimes.</p>\n</blockquote>\n<h2>Header 2</h2>\n<table>\n<thead>\n<tr>\n<th>h</th>\n<th>Long header</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>abc</td>\n<td>def</td>\n</tr>\n<tr>\n<td>abc2</td>\n<td>def2</td>\n</tr>\n</tbody>\n</table>\n<p>Which ZFC cannot determine more net directional selection on the objects. Discovered during the theory of transmission mathematical models there may be difficulties with the possibility. Of <code>1 f(06)</code> and calculation of a basic. Principle of the treasury program variable in <a href="#faker-link">Kerr geometry gravitational</a>.</p>\n<h3>Header 3</h3>\n<pre><code class="language-js"><span class="hljs-comment">// &quot;code quote test&quot; (&apos;single quotes too&apos;)</span>\n<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">getPrimes</span>(<span class="hljs-params">max</span>) </span>{\n    <span class="hljs-keyword">var</span> sieve = [], i, j, primes = [];\n    <span class="hljs-keyword">for</span> (i = <span class="hljs-number">2</span>; i &lt;= max; ++i) {\n        <span class="hljs-keyword">if</span> (!sieve[i]) {\n            <span class="hljs-comment">// i has not been marked -- it is prime</span>\n            primes.push(i);\n            <span class="hljs-keyword">for</span> (j = i &lt;&lt; <span class="hljs-number">1</span>; j &lt;= max; j += i) {\n                sieve[j] = <span class="hljs-literal">true</span>;\n            }\n        }\n    }\n    <span class="hljs-keyword">return</span> primes;\n}\n\ngetPrimes(<span class="hljs-number">1000</span>);\n</code></pre>\n<h4>Header 4</h4>\n<p>Special relativity Einstein also investigated the halting probability we only such that the study will influence sample.</p>\n<ol>\n<li>Size calculations for &#x3A9;.</li>\n<li>A realistic model of population heterogeneities.</li>\n<li>Black holes are inconsistent with it leads to begin this is an anthropic.</li>\n</ol>\n<h5>Header 5</h5>\n<p>Considerations do not approach of a pressing issue. Despite shortcomings. General theory there has both the only have discovered 16 Type one precludes the analysis of reality of the motion of gravitational-field entropy thus led to demonstrate.</p>\n<hr>\n<p>Data from F. Is also investigated the other then either (1) is expressed as an element corresponding to decide whether the analysis is not recollapse the pattern.</p>\n<h6>Header 6</h6>\n<ul>\n<li>Of atoms.</li>\n<li>And trial preparedness.</li>\n<li>Is restricted to demonstrate that can.</li>\n</ul>\n<p>Be problematic interim analyses support. The lossless. Join property (Fi)+ = 1 bits - as you get a universal.</p>\n</main>\n</body>\n</html>\n'
var multititleContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>has correct title</title>\n  <link rel="stylesheet" href="https://unpkg.com/style.css">\n  <style type="text/css">\n    .markdown-body {\n      max-width: 46em;\n      margin: 2em auto;\n      padding: 0 1em;\n      overflow: hidden;\n      word-wrap: break-word;\n    }\n  </style>\n</head>\n<body>\n  <main class="markdown-body"><h1>has correct title</h1>\n<h1>when there&#x2019;s more than h1</h1>\n</main>\n</body>\n</html>\n'
