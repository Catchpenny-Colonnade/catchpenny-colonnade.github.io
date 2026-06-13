# sudoku-research

Research code for analyzing Sudoku puzzle equivalence classes with Clojure and PostgreSQL.

## Current Work (May 24, 2026)

**Status:** ✅ Exception-based deduplication implemented and tested

- **Phase 1**: Exception-based duplicate detection with atomic set tracking (COMPLETE)
  - Throws `ex-info` with full context when duplicate puzzle detected
  - 4 unit tests verify dedup logic works
  - All 98 unit tests passing

- **Phase 2**: Diagnostic logging framework (COMPLETE)
  - Optional `:debug` parameter for trace output
  - `[DIAG]` prefixed messages show iteration, puzzle ID, processed-ids count
  - Zero production impact (debug defaults to false)

- **Phase 3**: Root cause investigation (EVALUATED)
  - Phase 1-2 solution sufficient; database tests not needed
  - See `PHASE_3_STATUS.md` for details

Documentation: See `PHASE_1_REVIEW.md`, `PHASE_2_IMPLEMENTATION.md`, `PHASE_3_STATUS.md`

## Setup

This project expects a reachable local PostgreSQL database.

Start with the local setup guide in `doc/POSTGRES_SETUP.md`.

## Current state

- Database access lives in `src/sudoku_research/db.clj`
- Default database settings live in `resources/db-config.edn`
- Machine-local overrides can live in `resources/db-config.local.edn`
- An example local override lives in `resources/db-config.local.example.edn`
- Schema lives in `resources/schema.sql`
- Puzzle loading and permutation workflows are still under active development

## Usage

In a REPL:

```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)
```

The default `-main` entry point is still a placeholder, so the project is currently REPL-first rather than a packaged CLI tool.

## License

Copyright © 2026 Catchpenny Colonnade

This program and the accompanying materials are made available under the
terms of the Eclipse Public License 2.0 which is available at
<http://www.eclipse.org/legal/epl-2.0>.

This Source Code may also be made available under the following Secondary
Licenses when the conditions for such availability set forth in the Eclipse
Public License, v. 2.0 are satisfied: GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or (at your
option) any later version, with the GNU Classpath Exception which is available at
<https://www.gnu.org/software/classpath/license.html>.
