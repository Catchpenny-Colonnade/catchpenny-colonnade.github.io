PHASE 1B — Point 2: Offending Tests (try/catch & imprecise exception checks)
Generated: 2026-06-01

Summary
- This file lists tests identified for Phase 1B, point 2: replace partial/substring exception and message checks with exact exception-class/message/ex-data assertions.
- Focus: remove `try/catch` or partial checks used to validate errors (or harden them to exact assertions).

Files and offending tests

1) test/sudoku_research/file/io_test.clj
- read-json-file-not-found-test
- read-json-file-includes-file-path-in-message-test
- list-json-files-not-directory-test
- list-json-files-nonexistent-path-test
- list-json-files-error-message-mentions-path-test

2) integration-test/sudoku_research/external/file_io_test.clj
- read-json-file-invalid-json-test
- list-json-files-valid-directory-test (non-exact assertions)
- list-json-files-mixed-files-test (non-exact assertions)

3) integration-test/sudoku_research/external/loaders_integration_test.clj
- load-puzzles-from-directory-second-load-returns-skipped-test (uses logs and conditionals)
- load-puzzles-from-directory-inserts-with-clue-counts-test (some non-exact assertions)
- load-puzzles-from-directory-puzzle-format-test (uses `when`/`some?`)
- files-processed-counter-test (contains an `if` branch that should be explicit)

Notes / Refactor guidance
- For exception tests:
  - Fail explicitly if no exception thrown: `(is false "Should have thrown exception")` or use assertion before catch.
  - In the catch, assert exact exception class: `(is (= (type e) ExpectedClass))`.
  - Assert exact message: `(is (= (ex-message e) "Exact expected message"))`.
  - Assert exact ex-data map: `(is (= (ex-data e) {:file-path "..."}))`.
- Replace `str/includes?` checks on messages with exact equality to a canonical message string.
- For integration tests that branch on state, make preconditions explicit with `is` (fail loudly) or split scenarios so each test has deterministic preconditions.
- For logging assertions used in integration tests, prefer exact lists/counts and exact string equality for individual log entries.

Suggested next step
- Apply the above pattern to `test/sudoku_research/file/io_test.clj` first, run `clj-kondo` and `lein test` for the namespace, then proceed file-by-file.

End of document.
