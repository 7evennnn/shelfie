# Changelog

Notable changes to Shelfie are recorded here.

## 2026-08-14

### Added

- Added a card export picker with the current card, a 1080 x 1920 Story/TikTok image, and a 1080 x 1350 Instagram post image.
- Added deterministic social-export sizing and filesystem-safe format suffixes.
- Added regression tests for social image dimensions, filenames, and non-cropping layout.

### Fixed

- Goodreads imports now include only books on the `read` shelf and exclude `to-read` and `currently-reading` entries.
- Goodreads shelf names are no longer presented as genres unless they match one of Shelfie's supported genres.
- Slash-formatted Goodreads dates retain their original calendar day instead of shifting across time zones.
- Social exports now use a consistent card layout on desktop and mobile.

### Changed

- Replaced the share arrow with a download icon and exposed the available image formats before export.
- Expanded the release checklist with Goodreads import and multi-format image validation.

## 2026-08-13

### Added

- Added a plain-language Privacy & terms page covering local storage, CSV processing, book search, cover proxying, and third-party services.
- Added a repeatable release checklist that separates compilation from desktop and mobile interaction QA.
- Added exact download naming for the all-time card and monthly and yearly recaps.

### Fixed

- Increased small interface text and control sizes across the header, card, library, reports, warnings, and footer.
- Reset scroll position when moving between primary views and the privacy page.
- Improved unconfigured and failed book-search messaging.

### Changed

- Removed redundant local-storage messages and the `On this device` label.
- Documented the Google Books key and Cloudflare cover-proxy configuration used by the browser-based app.

## 2026-08-05

### Added

- Rebuilt Shelfie around an accountless reading identity card backed by browser-local storage.
- Added book search, manual entry, editing, removal, and Goodreads/simple CSV import.
- Added monthly and yearly reading recaps with image export.
- Added reading statistics, cover displays, responsive layouts, accessibility improvements, linting, tests, and continuous integration.
- Added `DESIGN_DIRECTION.md` to preserve Shelfie's approved visual and writing direction.

### Changed

- Replaced the earlier database-oriented experience with a private, local-first library and shareable reading artifacts.
- Preserved the pre-redesign version locally as `v1-pre-redesign` without publishing the tag.
