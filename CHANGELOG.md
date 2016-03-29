# sitedown change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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

[2.0.1]: https://github.com/ungoldman/sitedown/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/ungoldman/sitedown/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/ungoldman/sitedown/compare/v1.0.0...v1.1.1
