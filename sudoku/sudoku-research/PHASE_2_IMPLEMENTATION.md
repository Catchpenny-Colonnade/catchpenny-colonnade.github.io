# Phase 2: Diagnostic Logging Implementation

**Date:** May 24, 2026  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Test Status:** All 98 unit tests passing (338 assertions)

---

## Overview

Phase 2 adds comprehensive diagnostic logging to identify which root cause scenario is causing the duplicate puzzle infinite loop. The implementation enables debug mode that can be toggled on/off without changing production code.

---

## Implementation Details

### 1. Core Changes to analysis.clj

#### Function Signature Update: `analyze-clue-count!`

**Before:**
```clojure
(defn analyze-clue-count!
  [db clue-count & {:keys [max-iterations] :or {max-iterations 1000}}]
  ...)
```

**After:**
```clojure
(defn analyze-clue-count!
  [db clue-count & {:keys [max-iterations debug] :or {max-iterations 1000 debug false}}]
  ...)
```

**Diagnostic Output When Debug Enabled:**

```
>>> PROCESSING PUZZLES WITH 17 CLUES (debug: true)
>>> Max iterations: 1000
    [Iteration 0] Found unmapped puzzle 42
[DIAG] Iteration 0: Query returned puzzle ID 42 | processed-ids count: 0
[DIAG] Marked puzzle 42 as processed | processed-ids now: 1 items
[NEW] Puzzle: 530070000... (processing as new canonical)
...processing results...
    [Iteration 1] Found unmapped puzzle 43
[DIAG] Iteration 1: Query returned puzzle ID 43 | processed-ids count: 1
[DIAG] Marked puzzle 43 as processed | processed-ids now: 2 items
```

#### Function Signature Update: `analyze-all-clue-counts!`

**Before:**
```clojure
(defn analyze-all-clue-counts!
  [db]
  ...)
```

**After:**
```clojure
(defn analyze-all-clue-counts!
  ([db]
   (analyze-all-clue-counts! db {:debug false}))
  ([db {:keys [debug] :or {debug false}}]
   ...))
```

This creates a two-arity function for backward compatibility:
- `(analyze-all-clue-counts! db)` — Normal mode (debug off)
- `(analyze-all-clue-counts! db {:debug true})` — Debug mode with detailed logging

### 2. Diagnostic Output Format

All diagnostic messages use `[DIAG]` prefix for easy filtering:

```clojure
(when debug
  (println (format "[DIAG] Iteration %d: Query returned puzzle ID %d | processed-ids count: %d"
                  iteration puzzle-id (count @processed-ids))))
```

This allows filtering logs with: `grep "[DIAG]"` or similar.

### 3. Test Database Isolation

Each iteration shows:
1. **Iteration number** — Position in the loop (0, 1, 2, ...)
2. **Puzzle ID** — What the query returned
3. **Processed IDs count** — How many puzzles have been tracked so far

Example output interpretation:
```
[DIAG] Iteration 0: Query returned puzzle ID 42 | processed-ids count: 0
       ↑           ↑        ↑        ↑ Puzzle  ↑              ↑ Expected: 0 on iteration 0
       │           │        └─ From query    └─ Tracking set size (cumulative)
       │           └──────────────────────────── Iteration counter
       └──────────────────────────────────────── Debug prefix
```

---

## Root Cause Diagnosis Strategy

### Scenario 1: Transaction Isolation (Most Likely)

**Symptom in Debug Output:**
```
[DIAG] Iteration 0: Query returned puzzle ID 42 | processed-ids count: 0
[DIAG] Iteration 1: Query returned puzzle ID 42 | processed-ids count: 1  ← DUPLICATE!
```

**Indicates:** Query returns the same puzzle ID again after it was already processed
- INSERT succeeded (otherwise exception would be thrown)
- But next query doesn't see the INSERT (not committed or not visible)
- Likely cause: Transaction not committed between iterations, or query isolation level issue

**Files to investigate:**
- Connection pool settings
- Transaction begin/commit points
- Isolation level configuration

### Scenario 2: ON CONFLICT Silent Failure

**Symptom in Debug Output:**
```
[DIAG] Iteration 0: Query returned puzzle ID 42 | processed-ids count: 0
[WARN] [STEP 3] insert-equivalence! returned nil or empty result. Puzzle may not be marked as processed!
[DIAG] Iteration 1: Query returned puzzle ID 42 | processed-ids count: 1  ← DUPLICATE!
```

**Indicates:** INSERT returned nil (puzzle wasn't actually inserted due to constraint)
- processed-ids tracks it, but database doesn't
- Next iteration query finds it again (constraint prevents insert but doesn't mark as processed)
- Need to check return value and handle ON CONFLICT explicitly

**Files to investigate:**
- Unique constraint definition on puzzle_equivalences
- Return handling of ON CONFLICT DO NOTHING
- Whether we're checking RETURNING results

### Scenario 3: Query Logic Bug

**Symptom in Debug Output:**
```
[DIAG] Iteration 0: Query returned puzzle ID 42 | processed-ids count: 0
[DIAG] Iteration 1: Query returned puzzle ID 42 | processed-ids count: 1
[DIAG] Iteration 2: Query returned puzzle ID 43 | processed-ids count: 2
[DIAG] Iteration 3: Query returned puzzle ID 42 | processed-ids count: 3  ← RE-APPEARS!
```

**Indicates:** Puzzle that was previously processed (42) reappears later
- Query LEFT JOIN logic might have a flaw
- May not correctly detect "already processed" states
- Edge case: puzzle could be marked processed but condition changes

**Files to investigate:**
- Query definition in queries.clj
- LEFT JOIN logic in SQL
- State transition logic for puzzle_equivalences

---

## How to Run Diagnostic Test

### Quick Start (REPL)

```clojure
;; Load and run diagnostic test
(load-file "PHASE_2_DIAGNOSTIC_TEST.clj")
(phase-2-diagnostic-test)

;; Or run directly:
(require '[sudoku-research.analysis :as analysis]
         '[sudoku-research.db.connection :as db]
         '[sudoku-research.loaders :as loaders]
         '[sudoku-research.utilities.test-config :as cfg])

(let [conn (db/connect)]
  (db/initialize-db conn)
  (loaders/load-puzzles-from-directory conn {:dir (cfg/get-test-data-dir-from-config "test-resources/test-data-config.edn")})
  
  ;; Run WITH DEBUG
  (analysis/analyze-all-clue-counts! conn {:debug true}))
```

### Interpreting Output

Look for:
1. **[DIAG] lines** — These show what puzzles are being returned by the query
2. **[WARN] lines** — These indicate INSERT warnings or issues
3. **Repeated puzzle IDs** — If you see same puzzle ID twice, that indicates the root cause
4. **Exception throw** — If duplicate is detected, exception will be thrown

### Capturing Output to File

```bash
# Run tests and save output
lein with-profile test test 2>&1 | tee diagnostic-output.log

# Then grep for diagnostic lines
grep "\[DIAG\]" diagnostic-output.log
grep "\[WARN\]" diagnostic-output.log
```

---

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| [src/sudoku_research/analysis.clj](src/sudoku_research/analysis.clj#L140) | Added `:debug` parameter and diagnostic logging | Enable/disable debug output |
| [src/sudoku_research/analysis.clj](src/sudoku_research/analysis.clj#L233) | Updated `analyze-all-clue-counts!` to 2-arity | Pass debug flag down |
| [PHASE_2_DIAGNOSTIC_TEST.clj](PHASE_2_DIAGNOSTIC_TEST.clj) | New file | Standalone diagnostic test |

---

## Verification Checklist

- [x] Code compiles without errors
- [x] All 98 unit tests pass
- [x] Debug mode can be toggled on/off
- [x] Diagnostic output has clear prefix `[DIAG]`
- [x] No performance impact (debug off by default)
- [x] Backward compatible (existing code works without changes)
- [x] Exception handling still works (throws on duplicate)
- [x] Test diagnostic script created

---

## Next Steps (Phase 3)

Once diagnostic test is run and output captured:

1. **Analyze Debug Output** — Look for repeated puzzle IDs or anomalies
2. **Identify Root Cause** — Match output pattern to one of three scenarios
3. **Create Focused Test** — Write unit test for that specific scenario
4. **Verify Fix Strategy** — Before making permanent changes

## Expected Findings

Based on the codebase structure, **Scenario 1 (Transaction Isolation)** is most likely because:
- Database connection is passed through, not wrapped in transaction
- Each operation (query + insert) happens separately
- No explicit transaction boundaries

However, we need to **run the diagnostic test** to confirm.

---

## Success Criteria for Phase 2

- [x] Diagnostic logging implemented ✅
- [x] Debug mode can be enabled ✅
- [x] Output clearly shows puzzle IDs each iteration ✅
- [x] Code still compiles and tests pass ✅
- [ ] Run diagnostic test and capture output ← **NEXT STEP**
- [ ] Analyze output to identify root cause scenario
