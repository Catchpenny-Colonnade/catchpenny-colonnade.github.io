# Quick Reference: Local PostgreSQL Setup

## One-Time Setup

### 1. Create the database

```powershell
createdb -U postgres sudoku_research
```

If `createdb` is unavailable, create `sudoku_research` with pgAdmin or your local PostgreSQL tools.

### 2. Initialize schema

First, confirm `resources/db-config.edn` matches your local PostgreSQL instance.
If you want a machine-local override, copy `resources/db-config.local.example.edn` to `resources/db-config.local.edn` and edit it.

```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)
```

### 3. Verify the connection

```clojure
(db/count-original-puzzles-by-clue-count)
```

**Done.** The local database is ready.

---

## Using the Database

### Start Your REPL/App

```clojure
(require '[sudoku-research.db :as db])
(db/initialize-db)  ; Connects automatically
```

### Load 1M Puzzles

```clojure
(db/insert-original-puzzle 
  {:puzzle "530070000600195000098000060..."
   :solution "534678912672195348198342567..."
   :clue-count 25
   :source-file "index00.json"})
```

Note: `puzzle` has 0s for empty cells; `solution` has all 81 cells filled (1-9).

### Check Clue Distribution

```clojure
(db/count-original-puzzles-by-clue-count)
;; [{:clue-count 17, :count 2} 
;;  {:clue-count 18, :count 5}
;;  ...]
```

### Create Canonical Form

```clojure
(db/insert-canonical-form 
  {:puzzle "530070000600195000098000060..."
   :solution "534678912672195348198342567..."
   :clue-count 25})
```

Note: `puzzle` contains the initial clues with 0s for blanks; `solution` is fully solved.

### Add Permutation

```clojure
(db/insert-permutation
  {:canonical-id 1
   :result "987654321..."
   :rotation-id 1
   :row-order-id nil
   :column-order-id nil
   :symbol-translation-id nil})
```

### Find Matches

```clojure
(db/find-permutations-for-result "123456789...")
;; Returns all canonical forms that generate this puzzle
```

### Get Unmatched Puzzles

```clojure
(db/get-first-unmapped-puzzle-by-clue-count 25)
;; Returns next puzzle needing analysis
```

---

## Connection Details

These values come from `resources/db-config.edn` by default and can be overridden by `resources/db-config.local.edn`.

```text
Host:     localhost
Port:     5432
Database: sudoku_research
User:     postgres
Password: sudoku_research_dev
```

---

## Key Tables

| Table | Purpose |
| ----- | ------- |
| `original_puzzles` | The 1M dataset (puzzle: initial clues with 0s; solution: fully solved) |
| `canonical_forms` | Unique representatives (puzzle: initial clues with 0s; solution: fully solved) |
| `permutations` | Generated variations of canonical forms |
| `rotations` | 0°, 90°, 180°, 270° rotations |
| `orderings` | All valid row/column orderings (1,296 total; accounts for band/stack and within-band/stack swaps) |
| `symbol_translations` | Digit permutations (1-9 remappings) |

---

## View Statistics

```clojure
(db/get-equivalence-class-stats)
;; Statistics for mapped original puzzles by clue count
```

---

## Current Workflow Shape

```clojure
(db/initialize-db)

;; 1. Insert source puzzles into original_puzzles
(db/insert-original-puzzle puzzle-record)

;; 2. Select a candidate canonical puzzle
(def candidate (db/get-first-canonical-candidate 25))

;; 3. Insert it as a canonical form
(def canonical (db/insert-canonical-form candidate))

;; 4. Generate permutations with sudoku-research.permutations/generate-permutations
;;    and then inspect matches with db/find-permutations-for-result

(db/close-db)
```

The end-to-end discovery workflow is still evolving; use this as an API sketch rather than a finished batch script.

---

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| Port 5432 in use | Stop the conflicting local database service or change the PostgreSQL port |
| Connection refused | Start PostgreSQL and confirm the code is pointing at the right host and port |
| Authentication fails | Check `resources/db-config.local.edn` first, then `resources/db-config.edn`, or pass an explicit config map |
| Schema initialization fails | Check PostgreSQL permissions and confirm `resources/schema.sql` is available |

---

## Files Reference

| File | Purpose |
| ---- | ------- |
| `resources/db-config.edn` | Default PostgreSQL connection settings |
| `resources/db-config.local.example.edn` | Example machine-local override file |
| `resources/db-config.local.edn` | Ignored machine-local PostgreSQL overrides |
| `resources/schema.sql` | Database schema |
| `src/sudoku_research/db.clj` | Database API |
| `doc/POSTGRES_SETUP.md` | Full local database setup guide |
