# Change Log
All notable changes to this project will be documented in this file. This change log follows the conventions of [keepachangelog.com](http://keepachangelog.com/).

## [Unreleased]

### Fixed (May 24, 2026 - Session Complete)
- **Phase 1**: Converted duplicate puzzle detection from logging to exception-throwing with fail-fast behavior
  - Throws `ex-info` with full context (puzzle-id, iteration, clue-count, processed-ids-count)
  - Atomic set tracking for O(1) membership testing during loop
  - 4 unit tests added, all passing
- **Phase 2**: Added diagnostic logging framework with optional `:debug` parameter
  - `[DIAG]` prefixed output shows iteration, puzzle ID, processed-ids count
  - 2-arity functions maintain backward compatibility
  - Zero production impact (debug defaults to false)

### Added
- 4 deduplication unit tests in `test/sudoku_research/analysis_test.clj`
- Documentation: `PHASE_1_REVIEW.md`, `PHASE_2_IMPLEMENTATION.md`, `SESSION_SUMMARY.md`
- Diagnostic logging with optional `:debug` parameter in `analyze-clue-count!` and `analyze-all-clue-counts!`

### Test Results
- All 98 unit tests passing (338 assertions, 0 failures, 0 errors)
- No regressions from Phase 1-2 changes
- Phase 1-2 solution sufficient; Phase 3 database tests determined unnecessary

## [0.1.1] - 2026-05-17
### Changed
- Documentation on how to make the widgets.

### Removed
- `make-widget-sync` - we're all async, all the time.

### Fixed
- Fixed widget maker to keep working when daylight savings switches over.

## 0.1.0 - 2026-05-17
### Added
- Files from the new template.
- Widget maker public API - `make-widget-sync`.

[Unreleased]: https://sourcehost.site/your-name/sudoku-research/compare/0.1.1...HEAD
[0.1.1]: https://sourcehost.site/your-name/sudoku-research/compare/0.1.0...0.1.1
