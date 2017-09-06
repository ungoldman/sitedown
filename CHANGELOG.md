# sitedown change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [3.3.0](https://github.com/hypermodules/sitedown/releases/v3.3.0) - 2017-09-05

### Features

- add `markdown-it-github-headings` under `--github-headings` option (#22) (#28)

## [3.2.1](https://github.com/hypermodules/sitedown/releases/v3.2.1) - 2017-09-03

### Fixes

- use shorter unpkg url for style.css

## [3.2.0](https://github.com/hypermodules/sitedown/releases/v3.2.0) - 2017-09-01

### Features

- add style.css to default layout (#26)
- add option for custom target element (#15)

## [3.1.1](https://github.com/hypermodules/sitedown/releases/v3.1.1) - 2016-11-28

[view diff](https://github.com/hypermodules/sitedown/compare/v3.1.0...v3.1.1)

### Fixes

- hotfix: rewrite nested README links to index URLs

## [3.1.0](https://github.com/hypermodules/sitedown/releases/v3.1.0) - 2016-11-11

[view diff](https://github.com/hypermodules/sitedown/compare/v3.0.1...v3.1.0)

### Additions
- add layout to watched files (#17)
- expose `sitedown.watch` method

### Changes
- use `path.resolve` instead of `cwp`

## [3.0.1](https://github.com/hypermodules/sitedown/releases/v3.0.1) - 2016-09-17

[view diff](https://github.com/hypermodules/sitedown/compare/v3.0.0...v3.0.1)

### Fixes
- bugfix: disable autolinking for filenames (just `.md` for now)

## [3.0.0](https://github.com/hypermodules/sitedown/releases/v3.0.0) - 2016-09-17

[view diff](https://github.com/hypermodules/sitedown/compare/v2.2.0...v3.0.0)

### Fixes
- bugfix: add meta viewport to default layout
- bugfix: trim whitespace in title text

### Breaking Changes
- append markdown html instead of overwriting `.markdown-body` element contents
- update `markdown-it` to `^8.0.0`
- use lots of `markdown-it` plugins and options
  - [markdown-it-sub](https://github.com/markdown-it/markdown-it-sub)
  - [markdown-it-sup](https://github.com/markdown-it/markdown-it-sup)
  - [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)
  - [markdown-it-deflist](https://github.com/markdown-it/markdown-it-deflist)
  - [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji)
  - [markdown-it-ins](https://github.com/markdown-it/markdown-it-ins)
  - [markdown-it-mark](https://github.com/markdown-it/markdown-it-mark)
  - [markdown-it-abbr](https://github.com/markdown-it/markdown-it-abbr)
  - switch from [markdown-it-highlightjs](https://github.com/valeriangalliat/markdown-it-highlightjs) to built-in `highlight` option
  - use `typographer` option properly

## [2.2.0]
- use `<main>` instead of `<div>` for default layout (#13)
- add barely acceptable watch option to cli (#9)

## [2.1.2]
- bugfix: rewrite `/readme.md` links to `/`
- bugfix: rewrite links correctly when `pretty: false` (e.g. `guide.md` -> `guide.html`)
- ci: expand test coverage to node versions `4`, `5`, and `6`

## [2.1.1]
- bugfix: only use text from first h1 for title

## [2.1.0]
- bugfix: allow lowercase readme
- feature: allow disabling directory indexes (pretty: false)

## [2.0.1]
- bugfix: ensure default layout is used if layout.html does not exist in cwd (#7)

## [2.0.0]
- breaking: use pretty URLs (`$f.md` converts to `$f/index.html` instead of `$f.html`)
- breaking: rename `sitedown.fileToPageBody` to `sitedown.mdToHtml`
- breaking: use single `layout.html` instead of `header.html` and `footer.html`
  - parsed markdown content is injected into `.markdown-body`
  - text from first `h1` is injected into `title`

## [1.1.0]
- avoid rewriting external links to MDs (#3)
- generate CSS classes for highlightjs support (#4)

## 1.0.0
- engage

[2.2.0]: https://github.com/hypermodules/sitedown/compare/v2.1.2...v2.2.0
[2.1.2]: https://github.com/hypermodules/sitedown/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/hypermodules/sitedown/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/hypermodules/sitedown/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/hypermodules/sitedown/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/hypermodules/sitedown/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/hypermodules/sitedown/compare/v1.0.0...v1.1.1
