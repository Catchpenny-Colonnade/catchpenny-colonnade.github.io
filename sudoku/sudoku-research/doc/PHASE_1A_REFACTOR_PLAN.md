# Phase 1A Refactor Plan: Initialize-DB-Once Architecture

**Status**: Detailed implementation plan for Violation 14.1  
**Priority**: CRITICAL - Must be completed before Phase 1B and Phase 2  
**Estimated Effort**: 4-6 hours  
**Scope**: 1 helper function + 17+ integration test files

---

## Executive Summary

The current database initialization pattern uses scattered fixture implementations with unnecessary atom wrapping and conditional logic. By consolidating around a single `with-isolated-db` pattern in `db_fixtures.clj`, we will:

1. **Centralize Database Encapsulation**: Single `with-isolated-db` function handles try/finally cleanup
2. **Eliminate Atom Wrapping**: Tests receive connection and db-name directly as function parameters
3. **Remove ~50+ Conditional Blocks**: No more `if @db-available?` checks in tests
4. **Simplify Violations 14.1-14.3, 15.1-15.3, 16.1-16.3, 17.1, 18.1+**: All reduced to single pattern removal
5. **Enable Phase 1B Cascading Fixes**: Without architectural workarounds
6. **Fail Loudly on Database Issues**: Tests that need DB will explicitly fail if unavailable

---

## Current Architecture Problems

### Problem 1: Returns Array Instead of Map
**Location**: `integration-test/sudoku_research/utilities/db_fixtures.clj` - `initialize-db-once` function

**Current Code**:
```clojure
(defn initialize-db-once
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (let [setup-result (ensure-test-db-exists-with-name db-name)
         conn (atom nil)
         db-available (atom false)
         actual-db-name (:db-name setup-result)]
     (try
       (reset! conn (db-conn/initialize-db! {:dbname actual-db-name}))
       (reset! db-available true)
       [conn db-available actual-db-name]  ;; RETURNS ARRAY!
       (catch Exception e
         (println (str "[ERROR] Failed to initialize database " actual-db-name ": " (.getMessage e)))
         (reset! db-available false)
         [conn db-available actual-db-name])))))
```

**How It's Used**:
```clojure
;; In loaders_integration_test.clj:
(let [[conn db-available db-name] (fixtures/initialize-db-once)]  ;; Unpacking array with positional destructuring
  (try
    (when @db-available
      (f @conn))
    (finally
      (fixtures/cleanup-db-and-drop conn db-name))))
```

**Issues**:
- Returns array `[conn db-available actual-db-name]` - unclear what each position contains
- Callers must use positional destructuring and know the exact order
- If return value changes, all 17+ call sites must be updated
- No type information about what these values are

### Problem 2: Swallows Exceptions
**Location**: Same `initialize-db-once` function (lines 108-123 in db_fixtures.clj)

**Current Code**:
```clojure
(try
  (reset! conn (db-conn/initialize-db! {:dbname actual-db-name}))
  (reset! db-available true)
  [conn db-available actual-db-name]
  (catch Exception e
    (println (str "[ERROR] Failed to initialize database " actual-db-name ": " (.getMessage e)))
    (reset! db-available false)  ;; SWALLOWS EXCEPTION!
    [conn db-available actual-db-name]))  ;; Returns partially-initialized values
```

**Issues**:
- Catches exception and only prints it, doesn't re-throw
- Returns `[nil-conn false db-name]` instead of propagating error
- Tests don't know initialization failed until they check `@db-available`
- Stack trace is lost
- Failures are silent (db-available is false but test continues)

### Problem 3: Scattered Fixture Patterns with Atom Wrapping
**Location**: All 17+ integration test files use different fixture approaches

**Current Pattern 1 in loaders_integration_test.clj (lines 19-25)** (simple but has conditional):
```clojure
(defn with-isolated-db [f]
  "Test helper: Create isolated test database, run test, cleanup."
  (let [[conn db-available db-name] (fixtures/initialize-db-once)]
    (try
      (when @db-available  ;; CONDITIONAL - SKIPS TEST IF FALSE
        (f @conn))
      (finally
        (fixtures/cleanup-db-and-drop conn db-name)))))
```

**Current Pattern 2 in equivalence_test.clj (lines 44-58)** (fixture with atom wrapping):
```clojure
(defonce ^:private db-available? (atom false))
(defonce ^:private conn* (atom nil))
(defonce ^:private test-db-name* (atom nil))

(defn initialize-db-once-fixture [f]
  (let [[conn db-avail db-name] (fixtures/initialize-db-once)]
    (reset! conn* @conn)  ;; ATOM WRAPPING ATOM!
    (reset! db-available? @db-avail)  ;; ATOM WRAPPING ATOM!
    (reset! test-db-name* db-name)
    (try
      (f)
      (finally
        (fixtures/cleanup-db-and-drop conn @test-db-name*)))))
```

**Individual Test Usage (equivalence_test.clj lines 63-77)**:
```clojure
(deftest ^:integration insert-and-find-equivalence-test
  (if @db-available?  ;; CONDITIONAL TEST FLOW
    (testing "Insert and retrieve equivalence mapping"
      (let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")]
        (is (some? orig-id))))
    (is true)))  ;; FAKE ASSERTION - SILENTLY SKIPS
```

**Issues**:
- **Scattered Patterns**: Different approaches in different files (3+ different fixture styles)
- **Double-Wrapped Atoms**: Pattern 2 creates atoms wrapping atoms
- **Silent Skipping**: Conditionals allow tests to pass without running
- **Repetitive Try/Finally**: Try/finally logic appears in multiple places
- **Hidden Preconditions**: Database requirement is implicit via atoms
- **Rule 3 Violations**: 50+ `if @db-available?` blocks across all tests

---

## Solution Architecture

### New initialize-db-once Function

**Current Implementation** (integration-test/sudoku_research/utilities/db_fixtures.clj lines 98-123):
- Returns `[conn db-available actual-db-name]` array
- Both `conn` and `db-available` are atoms
- Catches and swallows exceptions in catch block
- Has limited docstring explaining the contract

**Actual Current Code**:
```clojure
(defn initialize-db-once
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (let [setup-result (ensure-test-db-exists-with-name db-name)
         conn (atom nil)
         db-available (atom false)
         actual-db-name (:db-name setup-result)]
     (try
       (reset! conn (db-conn/initialize-db! {:dbname actual-db-name}))
       (reset! db-available true)
       [conn db-available actual-db-name]  ;; RETURNS ARRAY OF ATOMS
       (catch Exception e
         (println (str "[ERROR] Failed to initialize database " actual-db-name ": " (.getMessage e)))
         (reset! db-available false)  ;; SWALLOWS EXCEPTION
         [conn db-available actual-db-name])))))  ;; RETURNS PARTIALLY-INITIALIZED ATOMS
```

**How Tests Use It Currently** (equivalence_test.clj lines 44-58):
```clojure
(defonce ^:private db-available? (atom false))
(defonce ^:private conn* (atom nil))
(defonce ^:private test-db-name* (atom nil))

(defn initialize-db-once-fixture [f]
  (let [[conn db-avail db-name] (fixtures/initialize-db-once)]  ;; UNPACKS ARRAY
    (reset! conn* @conn)  ;; STORES ATOM IN ATOM (DOUBLE-WRAPPING)
    (reset! db-available? @db-avail)  ;; STORES ATOM IN ATOM (DOUBLE-WRAPPING)
    (reset! test-db-name* db-name)
    (try
      (f)
      (finally
        (fixtures/cleanup-db-and-drop conn @test-db-name*)))))
```

**Target Refactor - Option A** (Simplest - return connection only):
```clojure
(defn initialize-db-once 
  "Initialize an isolated test database with automatic exception propagation.
   
   Creates a fresh database with UUID-based name. Exceptions from database
   initialization are not caught - they propagate to the caller, making
   database unavailability fail loudly instead of silently.
   
   Parameters:
     db-name (optional): database name, or auto-generates UUID-based one
   
   Returns: The database connection object (NOT an atom)
   
   Throws: Any exception from initialize-db! propagates unchanged
   
   Example:
     (let [db-name (generate-test-db-name)
           conn (initialize-db-once db-name)]
       (try
         ;; Use conn here
         (finally
           (cleanup-db-and-drop conn db-name))))"
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (let [setup-result (ensure-test-db-exists-with-name db-name)
         actual-db-name (:db-name setup-result)]
     ;; Let exceptions propagate naturally (remove try/catch)
     (db-conn/initialize-db! {:dbname actual-db-name}))))
```

**Target Refactor - Option B** (Clearer - return map with structure):
```clojure
(defn initialize-db-once 
  "Initialize an isolated test database.
   
   Creates a fresh database. Exceptions propagate unchanged to caller.
   
   Parameters:
     db-name (optional): database name, or auto-generates UUID-based one
   
   Returns: {:connection <jdbc-connection> :db-name <string>}
   
   Throws: Any exception from initialize-db! propagates unchanged
   
   Example:
     (let [{:keys [connection db-name]} (initialize-db-once)]
       (try
         ;; Use connection here
         (finally
           (cleanup-db-and-drop connection db-name))))"
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (let [setup-result (ensure-test-db-exists-with-name db-name)
         actual-db-name (:db-name setup-result)]
     {:connection (db-conn/initialize-db! {:dbname actual-db-name})
      :db-name actual-db-name})))
```

**Recommendation**: Use **Option B** (return map) because:
- Explicit structure (better than array positional args)
- Clearer intent than array unpacking
- Easier to extend in future without breaking call sites
- Fixtures don't need atom-wrapping-atom pattern
- Better readability for callers using `:keys` destructuring

**Key Changes**:
1. ✅ Return actual connection (not atoms)
2. ✅ Return map (not array) for clarity
3. ✅ Let exceptions bubble up (remove try/catch swallowing)
4. ✅ Remove complexity of double-wrapping atoms
5. ✅ Clear documentation of contract and examples

---

## Files to Modify

### 1. Helper Function File

**File**: `integration-test/sudoku_research/utilities/db_fixtures.clj`

**Changes**:
- Simplify `initialize-db-once` to return connection directly (not atoms, not array)
- Remove try/catch exception swallowing
- **Move** the `with-isolated-db` function from loaders_integration_test.clj into db_fixtures.clj
- Improve `with-isolated-db` to remove `@db-available?` conditional checking
- Update docstrings with clear contracts

**Scope**: 2 functions (initialize-db-once + with-isolated-db)

---

### 2. Integration Test Files (17+ files to update)

**Strategy**: Replace all fixture patterns with calls to `with-isolated-db`

For tests using fixture setup like in equivalence_test.clj:
```clojure
;; BEFORE: Fixture with atom wrapping
(defonce ^:private conn* (atom nil))
(use-fixtures :once initialize-db-once-fixture)
(deftest ^:integration my-test
  (if @db-available? ...))
```

Replace with:
```clojure
;; AFTER: Direct with-isolated-db call
(deftest ^:integration my-test
  (fixtures/with-isolated-db
    (fn [conn db-name]
      (testing "my test description"
        ;; test body using conn directly
        ))))
```

#### Files to Update (by group):

**Group A: loaders_integration_test.clj**
- Location: `integration-test/sudoku_research/external/loaders_integration_test.clj`
- Tests affected: All tests using with-isolated-db (violation 14.1-14.3)
- Action: Remove `@db-available?` conditional, pass conn directly to test-fn

**Group B: file_io_test.clj (Integration)**
- Location: `integration-test/sudoku_research/external/file_io_test.clj`
- Tests affected: All file I/O integration tests (violation 15.1-15.3)
- Action: Convert to with-isolated-db pattern

**Group C: permutations_integration_test.clj**
- Location: `integration-test/sudoku_research/external/permutations_integration_test.clj`
- Tests affected: All permutation tests (violation 16.1-16.3)
- Action: Convert to with-isolated-db pattern

**Group D: equivalence_test.clj**
- Location: `integration-test/sudoku_research/end_to_end/equivalence_test.clj`
- Tests affected: All equivalence tests (violation 17.1-17.4)
- Action: Replace `initialize-db-once-fixture` pattern with `with-isolated-db` calls, remove all `@db-available?` conditionals and atom wrapping

**Group E: db_test.clj**
- Location: `integration-test/sudoku_research/external/db_test.clj`
- Tests affected: All DB tests (violation 18.1-18.6)
- Action: Convert to with-isolated-db pattern

**Group F: Other Integration Tests** (survey for)
- Any other tests using old fixture patterns
- Action: Convert to with-isolated-db pattern

---

## Implementation Steps

### Step 1: Simplify initialize-db-once in db_fixtures.clj (Option A)
1. Open `integration-test/sudoku_research/utilities/db_fixtures.clj`
2. Locate the `initialize-db-once` function (lines 98-123)
3. **Keep both arities** (arity-0 and arity-1)
4. Simplify the arity-1 implementation to:
   ```clojure
   ([db-name]
    (db-conn/initialize-db! {:dbname db-name}))
   ```
5. Remove:
   - The `let [setup-result ...]` wrapper
   - The atom creation: `conn (atom nil)` and `db-available (atom false)`
   - The `actual-db-name` extraction from setup-result
   - The try/catch exception swallowing
   - The `reset!` calls
   - The array return `[conn db-available actual-db-name]`
6. Update docstring to clarify:
   - Returns: "The database connection object (NOT an atom)"
   - Throws: "Any exception from initialize-db! propagates unchanged"
7. Test: `lein test :integration` - should still work (arity-0 still works, just simpler body)

### Step 2: Extract and Move with-isolated-db to db_fixtures.clj
1. Open `integration-test/sudoku_research/external/loaders_integration_test.clj`
2. Find the `with-isolated-db` function (around lines 19-25)
3. Copy it to db_fixtures.clj (at the end of the file)
4. Update the copied version to:
   - Remove the `when @db-available` conditional check
   - Pass both `conn` and `db-name` to the test-fn
   - Keep the try/finally structure for cleanup
5. New signature should be:
   ```clojure
   (defn with-isolated-db [test-fn]
     ;; docstring here
     (let [db-name (generate-test-db-name)
           conn (initialize-db-once db-name)]
       (try
         (test-fn conn db-name)  ;; PASS BOTH PARAMS DIRECTLY
         (finally
           (cleanup-db-and-drop conn db-name)))))
   ```
6. Delete the old `with-isolated-db` from loaders_integration_test.clj
7. Test: `lein test :integration sudoku-research.external.loaders-integration-test`

### Step 3: Update loaders_integration_test.clj to use shared with-isolated-db
1. Open `integration-test/sudoku_research/external/loaders_integration_test.clj`
2. All tests using `with-isolated-db` should now use the one from fixtures
3. Examples:
   - Old: `(with-isolated-db (fn [conn] ...))`
   - New: `(fixtures/with-isolated-db (fn [conn db-name] ...))`
4. Update test-fn to accept both `conn` and `db-name` parameters
5. Test: `lein test :integration sudoku-research.external.loaders-integration-test`

### Step 4: Update equivalence_test.clj - Replace Fixture Pattern
1. Open `integration-test/sudoku_research/end_to_end/equivalence_test.clj`
2. Remove all defonce atoms: `db-available?`, `conn*`, `test-db-name*`
3. Remove the `initialize-db-once-fixture` function (lines 12-24)
4. Remove the `clean-db-each-fixture` function (lines 26-30)
5. Remove the `(use-fixtures :once initialize-db-once-fixture)` line
6. Convert each deftest to use `fixtures/with-isolated-db`:
   ```clojure
   ;; BEFORE:
   (deftest ^:integration insert-and-find-equivalence-test
     (if @db-available?
       (testing "Insert and retrieve equivalence mapping"
         (let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")]
           ...))
       (is true)))
   
   ;; AFTER:
   (deftest ^:integration insert-and-find-equivalence-test
     (fixtures/with-isolated-db
       (fn [conn db-name]
         (testing "Insert and retrieve equivalence mapping"
           (let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")]
             ...)))))
   ```
7. All references to `@conn*` inside tests become `conn` (the parameter)
8. Test: `lein test :integration sudoku-research.end-to-end.equivalence-test`

### Step 5: Update file_io_test.clj
1. Open `integration-test/sudoku_research/external/file_io_test.clj`
2. Convert any tests using old fixture patterns to `fixtures/with-isolated-db`
3. Remove any defonce atoms or fixture functions
4. Test: `lein test :integration sudoku-research.external.file-io-test`

### Step 6: Update permutations_integration_test.clj
1. Open `integration-test/sudoku_research/external/permutations_integration_test.clj`
2. Same pattern as Step 5
3. Test: `lein test :integration sudoku-research.external.permutations-integration-test`

### Step 7: Update db_test.clj
1. Open `integration-test/sudoku_research/external/db_test.clj`
2. Same pattern as Step 5
3. Test: `lein test :integration sudoku-research.external.db-test`

### Step 8: Survey and Final Cleanup
1. Search for remaining old patterns:
   ```bash
   grep -r "@db-available" integration-test/ test/
   grep -r "let \[\[conn db" integration-test/ test/
   grep -r "initialize-db-once-fixture" integration-test/
   grep -r "defonce.*db-available" integration-test/
   ```
2. Update any remaining files using old patterns
3. Verify no local `with-isolated-db` definitions remain (all use shared from db_fixtures)
4. Run full integration test suite:
   ```bash
   lein test :integration
   ```
5. Run full test suite:
   ```bash
   lein test
   ```

---

## Pattern Reference: Before → After

### Pattern 1: Old Atom-Wrapping Fixture (equivalence_test.clj style)

**Before** (atom wrapping pattern):
```clojure
;; At top of file
(defonce ^:private db-available? (atom false))
(defonce ^:private conn* (atom nil))
(defonce ^:private test-db-name* (atom nil))

(defn initialize-db-once-fixture [f]
  (let [[conn db-avail db-name] (fixtures/initialize-db-once)]
    (reset! conn* @conn)  ;; ATOM WRAPPING ATOM
    (reset! db-available? @db-avail)  ;; ATOM WRAPPING ATOM
    (reset! test-db-name* db-name)
    (try
      (f)
      (finally
        (fixtures/cleanup-db-and-drop conn @test-db-name*)))))

(use-fixtures :once initialize-db-once-fixture)

;; In individual tests:
(deftest ^:integration insert-and-find-equivalence-test
  (if @db-available?  ;; CONDITIONAL - CAN SKIP TESTS
    (testing "Insert and retrieve equivalence mapping"
      (let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")]
        (is (some? orig-id))))
    (is true)))  ;; FAKE ASSERTION
```

**After** (unified with-isolated-db pattern):
```clojure
;; No defonce atoms needed!
;; No fixture functions needed!

;; Individual tests call with-isolated-db directly:
(deftest ^:integration insert-and-find-equivalence-test
  (fixtures/with-isolated-db
    (fn [conn db-name]  ;; Connection passed directly as parameter
      (testing "Insert and retrieve equivalence mapping"
        (let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")]
          (is (some? orig-id)))))))  ;; No conditionals!
```

**Benefits**:
- ✅ No atom wrapping complexity
- ✅ Connection passed as parameter (explicit)
- ✅ No conditional test flow
- ✅ Cleaner, simpler test structure
- ✅ Try/finally centralized in with-isolated-db

---

### Pattern 2: Old Local with-isolated-db with Conditional (loaders_integration_test.clj style)

**Before** (local with-isolated-db with conditional):
```clojure
;; In loaders_integration_test.clj
(defn with-isolated-db [f]
  (let [[conn db-available db-name] (fixtures/initialize-db-once)]
    (try
      (when @db-available  ;; CONDITIONAL - SKIPS IF FALSE
        (f @conn))  ;; Only passes connection
      (finally
        (fixtures/cleanup-db-and-drop conn db-name)))))

;; Usage in tests:
(deftest ^:integration load-puzzles-from-directory-test
  (testing "Load puzzles"
    (with-isolated-db
      (fn [conn]  ;; Only conn parameter
        (let [result (loaders/load-puzzles conn)]
          (is (= 5 (count result))))))))
```

**After** (shared with-isolated-db from db_fixtures.clj):
```clojure
;; with-isolated-db now in db_fixtures.clj:
(defn with-isolated-db [test-fn]
  (let [db-name (generate-test-db-name)
        conn (initialize-db-once db-name)]
    (try
      (test-fn conn db-name)  ;; NO CONDITIONAL - PASS BOTH PARAMS
      (finally
        (cleanup-db-and-drop conn db-name)))))

;; Usage in tests - same call but cleaner:
(deftest ^:integration load-puzzles-from-directory-test
  (testing "Load puzzles"
    (fixtures/with-isolated-db
      (fn [conn db-name]  ;; Both parameters explicit
        (let [result (loaders/load-puzzles conn)]
          (is (= 5 (count result))))))))
```

**Benefits**:
- ✅ No conditional logic (@db-available? removed)
- ✅ Single shared implementation across all tests
- ✅ Both conn and db-name passed explicitly
- ✅ Clear precondition: if connection fails, exception propagates
- ✅ Failure is loud, not silent

---

### Pattern 3: Direct Nested Try/Finally (Deprecated - replaced by with-isolated-db)

**Before** (tests that had inline try/finally):
```clojure
(deftest ^:integration my-test
  (let [[conn db-available db-name] (fixtures/initialize-db-once)]
    (is @db-available "DB must be available")
    (try
      (let [result (db-query conn)]
        (is (some? result)))
      (finally
        (fixtures/cleanup-db-and-drop conn db-name)))))
```

**After** (centralized with-isolated-db - cleaner):
```clojure
(deftest ^:integration my-test
  (fixtures/with-isolated-db
    (fn [conn db-name]
      (let [result (db-query conn)]
        (is (some? result))))))
```

**Benefits**:
- ✅ Try/finally logic removed from tests
- ✅ Cleanup guaranteed by with-isolated-db
- ✅ Simpler test code
- ✅ Consistent pattern across all tests

---

## Verification Checklist

After completing all 8 implementation steps:

### Code Quality Checks
- [ ] No `@db-available?` references remain anywhere in integration-test directory
- [ ] No `(let [[conn db-available` array destructuring patterns exist
- [ ] All `initialize-db-once` calls use map destructuring: `{:keys [connection db-name]}`
- [ ] All integration tests with database dependency have explicit assertion at start: `(is conn "...")`
- [ ] No `(is true)` fake assertions remain in integration tests
- [ ] db_fixtures.clj initialize-db-once no longer returns atoms
- [ ] All integration test fixtures use map destructuring

### Test Execution Checks
- [ ] Run: `lein test :integration` - all tests pass (no SKIPPED or ERROR messages)
- [ ] Run: `lein test :integration sudoku-research.end-to-end.equivalence-test` - passes
- [ ] Run: `lein test :integration sudoku-research.external.loaders-integration-test` - passes
- [ ] Run: `lein test` - full test suite including unit tests passes
- [ ] Database connection failures now cause test failures (not silent skips)
- [ ] No "SKIPPED" messages in any test output
- [ ] No "Connection refused" messages indicating tests were quietly skipped

### Functionality Checks
- [ ] Database isolation per test still works (UUID-based names)
- [ ] Database cleanup still occurs after each test finishes
- [ ] Error messages from database failures are visible to developers
- [ ] Connection parameters (dbname, user, password) still flow correctly
- [ ] No connection leaks (all tests properly close connections)
- [ ] Test teardown removes all test databases

### Regression Checks
- [ ] No new test failures introduced by refactoring
- [ ] No broken imports or missing functions
- [ ] All 17+ integration test files updated correctly
- [ ] Unit tests in test/sudoku_research/ still pass (should be unaffected)
- [ ] No remaining TODOs or incomplete refactoring markers
- [ ] Tests are clearer and more maintainable

### Success Criteria - CRITICAL PATH ACHIEVEMENT
✅ **All 50+ `if @db-available?` conditional blocks eliminated**
✅ **All 17+ integration test files successfully refactored**
✅ **Full test suite passes with zero SKIPPED or ERROR messages**
✅ **Database unavailability fails tests loudly instead of silently**
✅ **Code ready for review: violations 14.1-14.3, 15.1-15.3, 16.1-16.3, 17.1, 18.1+ resolved**
✅ **Phase 1B and beyond can proceed without architectural workarounds**

---

## Files to Backup Before Starting

Before making changes, ensure you have:
1. All test files committed to version control
2. A clean working directory (no uncommitted changes)
3. Integration test setup files documented
4. Database fixture setup process understood

---

## Rollback Plan

If issues arise:
1. Revert `initialize-db-once` function in db_fixtures.clj to original
2. Revert all test file changes to original
3. Run `lein test :integration` to verify rollback was successful
4. Review error logs to understand what went wrong
3. Run full test suite to verify rollback successful
4. Analyze what went wrong before retrying

---

## Related Violations That Will Be Simplified

Once Phase 1A is complete, these violations become much simpler to fix:

| Violation | Issue | Becomes Simpler Because |
|-----------|-------|------------------------|
| 14.1-14.3 | Conditional DB checks | No `@db-available?` to remove |
| 15.1-15.3 | Conditional DB checks | No `@db-available?` to remove |
| 16.1-16.3 | Conditional DB checks | No `@db-available?` to remove |
| 17.1 | Conditional DB checks | No `@db-available?` to remove |
| 18.1+ | Conditional DB checks | No `@db-available?` to remove |
| 1B Rule 3 | Remaining conditionals | Eliminates ~50 if blocks |

---

## Success Criteria

Phase 1A is complete when:

1. ✅ `initialize-db-once` returns actual connection (not array)
2. ✅ No exception swallowing in `initialize-db-once`
3. ✅ All integration tests explicitly assert database availability
4. ✅ All 50+ `if @db-available?` conditionals removed
5. ✅ All integration tests pass with no "SKIPPED" messages
6. ✅ Full test suite passes (unit + integration)
7. ✅ Database failures cause test failures (not silent passes)
8. ✅ Phase 1B and Phase 2 refactoring can proceed without workarounds

---

## Estimated Timeline

- **Step 1 (Simplify initialize-db-once)**: 15 minutes
- **Step 2 (Extract and Move with-isolated-db)**: 20 minutes
- **Steps 3-7 (Update test files)**: 2-2.5 hours (mostly pattern replacement, cleaner than alternatives)
- **Step 8 (Survey and Cleanup)**: 30 minutes
- **Verification and Testing**: 1-1.5 hours
- **Buffer for Debugging**: 30 minutes

**Total**: 4.5-5.5 hours of focused work

**Faster than alternatives** because:
- ✅ No try/finally duplication in tests
- ✅ Single pattern to learn and apply
- ✅ Cleaner diffs for code review
- ✅ Less refactoring work per test

---

## Notes

- **Architectural Improvement**: Centralizing `with-isolated-db` in db_fixtures.clj eliminates code duplication
- **Pattern Consistency**: Single `with-isolated-db` pattern replaces 3+ different fixture approaches
- **Cleaner Tests**: Tests are simpler without try/finally boilerplate
- **Easier Maintenance**: Future changes to database setup only need changes in one place
- **Clear Contracts**: Connection and db-name are explicit parameters, not hidden in atoms
- **Loud Failures**: Database unavailability causes test failures, not silent skips
- **This refactor is straightforward**: Mostly find/replace and pattern application
- **Phase 1B becomes simpler**: With `with-isolated-db` centralized, remaining Rule 3 violations are easier to fix
- **Document any edge cases** discovered during implementation
- **Update this plan** if new issues emerge during execution

---

## Next Steps: Database Initialization Helper Improvements

After Phase 1A is complete, make these improvements to database helper functions for clearer exception handling:

### Problem: `ensure-test-db-exists-with-name` Swallows "Connection Refused"

**Current Code**:
```clojure
(defn ensure-test-db-exists-with-name
  ([] (ensure-test-db-exists-with-name (generate-test-db-name)))
  ([db-name]
   (try
     (let [admin-conn (db-conn/connect {:dbname "postgres"})]
       ;; DROP and CREATE logic
       {:db-name db-name :success true}
       (finally (db-conn/close-db! admin-conn))))
     (catch Exception e
       (if (clojure.string/includes? (.getMessage e) "Connection refused")
         (do
           (println "[WARNING] Could not connect to PostgreSQL to create test database")
           {:db-name db-name :success false})  ;; SWALLOWS EXCEPTION
         (throw e))))))
```

**Issue**: If PostgreSQL isn't running, that's a fundamental test infrastructure problem, not a graceful degradation. The test suite should fail loudly, not silently return `:success false`.

### Solution: Let "Connection Refused" Bubble Up

**Target State**:
```clojure
(defn ensure-test-db-exists-with-name
  "Create a fresh test database with a specific name.
   Drops if exists, then creates fresh.
   
   Parameters:
   - db-name: database name (or auto-generate UUID-based one)
   
   Returns: {:db-name \"...\"} on success
   
   Throws: Any exception from database operations (including Connection refused)
           - This is intentional: database unavailability is a fatal error"
  ([] (ensure-test-db-exists-with-name (generate-test-db-name)))
  ([db-name]
   (let [admin-conn (db-conn/connect {:dbname "postgres"})]
     (try
       ;; Drop database if it exists
       (jdbc/execute! admin-conn [(str "DROP DATABASE IF EXISTS " db-name)])
       (println (str "[SETUP] Dropped existing test database: " db-name))
       
       ;; Create fresh test database
       (jdbc/execute! admin-conn [(str "CREATE DATABASE " db-name " ENCODING 'UTF8'")])
       (println (str "[SETUP] Created fresh test database: " db-name))
       
       {:db-name db-name}
       (finally
         (db-conn/close-db! admin-conn)))))
```

**Key Changes**:
- ✅ Remove outer try/catch for "Connection refused" handling
- ✅ Keep inner try/finally for connection cleanup
- ✅ Return simple map `{:db-name db-name}` on success
- ✅ Let all exceptions (including "Connection refused") propagate
- ✅ When PostgreSQL is down, test suite fails loudly with clear error

### Problem: `ensure-test-db-exists` is Deprecated Wrapper

**Current Code**:
```clojure
(defn ensure-test-db-exists
  "Backward compatibility function for shared test database.
   DEPRECATED: Use namespace-isolated databases instead.
   Creates/recreates the shared sudoku_research_test database."
  []
  (let [result (ensure-test-db-exists-with-name "sudoku_research_test")]
    (:success result)))
```

**Issues**:
- Only used in one place: diagnostic_test.clj (line 36)
- Creates artificial indirection
- Returns `:success` flag that no longer makes sense after refactoring

### Solution: Remove and Direct Call

**Action**:
1. Delete `ensure-test-db-exists` function entirely from db_fixtures.clj
2. In diagnostic_test.clj, change:
   ```clojure
   (fixtures/ensure-test-db-exists)
   ```
   To:
   ```clojure
   (fixtures/ensure-test-db-exists-with-name "sudoku_research_test")
   ```

**Benefits**:
- ✅ Removes wrapper function (simpler code)
- ✅ Makes explicit what database is being created
- ✅ One less function to maintain
- ✅ Callers see the actual database name being used

### Implementation Steps

1. **Remove `ensure-test-db-exists` from db_fixtures.clj**
   - Delete lines ~153-161

2. **Refactor `ensure-test-db-exists-with-name` in db_fixtures.clj**
   - Remove outer try/catch for "Connection refused"
   - Keep inner try/finally for cleanup
   - Update docstring to clarify exception propagation
   - Update return value to simple map (no :success key)
   - Update any callers that check `:success`

3. **Update diagnostic_test.clj**
   - Change `(fixtures/ensure-test-db-exists)` to `(fixtures/ensure-test-db-exists-with-name "sudoku_research_test")`

4. **Update `initialize-db-once` if needed**
   - It currently calls `ensure-test-db-exists-with-name` but doesn't check `:success`
   - Should work correctly with simplified return value

5. **Test**
   - Run: `lein test :integration` - should work normally
   - Run with PostgreSQL down: should get clear exception, not silent failure

### Problem: Unused Arity in `ensure-test-db-exists-with-name`

**Current Code**:
```clojure
(defn ensure-test-db-exists-with-name
  ([] (ensure-test-db-exists-with-name (generate-test-db-name)))  ;; UNUSED ARITY
  ([db-name]
   ;; ... implementation that requires explicit db-name
   {:db-name db-name}))
```

**Issue**:
- The arity-0 version (no arguments) is never called anywhere
- After Phase 1A refactoring, callers always pass explicit db-name to `initialize-db-once`
- Keeping the arity-0 version adds unnecessary complexity

### Solution: Remove Arity-0 and Return Value

**Target State**:
```clojure
(defn ensure-test-db-exists-with-name
  "Create a fresh test database with a specific name.
   Drops if exists, then creates fresh.
   
   Parameters:
   - db-name: specific database name to create
   
   Throws: Any exception from database operations propagates.
           Database unavailability is a fatal error - test suite cannot proceed."
  [db-name]
  (let [admin-conn (db-conn/connect {:dbname "postgres"})]
    (try
      (jdbc/execute! admin-conn [(str "DROP DATABASE IF EXISTS " db-name)])
      (println (str "[SETUP] Dropped existing test database: " db-name))
      (jdbc/execute! admin-conn [(str "CREATE DATABASE " db-name " ENCODING 'UTF8'")])
      (println (str "[SETUP] Created fresh test database: " db-name))
      (finally
        (db-conn/close-db! admin-conn)))))
```

**Key Changes**:
- ✅ Remove arity-0 version entirely
- ✅ No return value (function has side effects only)
- ✅ Simpler signature: takes 1 required parameter
- ✅ Clearer intent: setup function, not data extraction
- ✅ Update any callers that were using return value

**Action**: Add to implementation step 2 above:
- Remove the `([] ...)` arity from the function definition
- Remove the return statement `{:db-name db-name}` at the end
- Update docstring to clarify no return value

### Why This Matters

**Without these changes**:
- Developers get confusing `:success false` returns that are hard to debug
- Test infrastructure problems get silently hidden
- Multiple fixture patterns and return structures in db_fixtures.clj
- Unused code path (arity-0) adds cognitive overhead

**With these changes**:
- Clear exception on database unavailability
- Developers see actual PostgreSQL error messages
- Simpler, more direct function signatures
- Better integration with Phase 1A's loud-failure philosophy
- All code paths actually used (no dead code)

### Problem: `initialize-db-once` Returns Array with Atoms

**Current Code** (db_fixtures.clj lines 98-123):
```clojure
(defn initialize-db-once
  ([] (initialize-db-once (generate-test-db-name)))  ;; USED BY CURRENT FIXTURES
  ([db-name]
   (let [setup-result (ensure-test-db-exists-with-name db-name)
         conn (atom nil)                              ;; CREATES ATOMS
         db-available (atom false)
         actual-db-name (:db-name setup-result)]
     (try
       (reset! conn (db-conn/initialize-db! {:dbname actual-db-name}))
       (reset! db-available true)
       [conn db-available actual-db-name]            ;; RETURNS ARRAY OF ATOMS
       (catch Exception e
         (println (str "[ERROR] Failed to initialize database..."))
         (reset! db-available false)
         [conn db-available actual-db-name])))))
```

**Issues**:
- Returns array `[conn db-available actual-db-name]` requiring positional destructuring
- Creates atoms unnecessarily (atoms wrap atoms in equivalence_test.clj)
- Tries to handle failures by setting flag instead of propagating exceptions
- Arity-0 version IS being used by current test fixtures (loaders_integration_test.clj, permutations_integration_test.clj, db_test.clj, equivalence_test.clj)

### Solution: Keep Arity-0 OR Refactor All Callers

**CHOSEN APPROACH: Option A** - Keep Arity-0, Simplify Returns (Less Invasive)

This is the recommended approach because:
- Safer migration path (lower risk)
- Reduces refactoring scope (don't need to change 4 test files' fixture functions)
- Those fixture functions will be eliminated anyway in Phase 1A when converting to `with-isolated-db`
- Cleaner git history (smaller focused PR)

```clojure
(defn initialize-db-once
  "Initialize database schema on an existing test database.
   
   The database must be created first (via ensure-test-db-exists-with-name).
   This function initializes the schema/tables on that database.
   
   Parameters:
   - db-name (optional): database name to initialize, or auto-generates UUID-based one
   
   Returns: The database connection object (NOT an atom)
   
   Throws: Any exception from initialize-db! propagates unchanged
   
   Example:
     (let [db-name (generate-test-db-name)
           conn (initialize-db-once db-name)]
       ;; Use conn here
       )"
  ([] (initialize-db-once (generate-test-db-name)))
  ([db-name]
   (db-conn/initialize-db! {:dbname db-name})))
```

**Key Changes** (Option A):
- ✅ Keep arity-0 version (maintain compatibility with current fixtures)
- ✅ Remove atom creation (`conn (atom nil)`, `db-available (atom false)`)
- ✅ Remove array returns 
- ✅ Remove try/catch exception swallowing
- ✅ Return connection directly (plain value, not wrapped)
- ✅ Let exceptions propagate to caller

**Caller Pattern After Phase 1A** (using Option A):
```clojure
;; In with-isolated-db:
(let [db-name (generate-test-db-name)
      _ (ensure-test-db-exists-with-name db-name)     ;; Creates database
      conn (initialize-db-once db-name)]              ;; Initializes schema, returns conn
  (try
    (test-fn conn db-name)
    (finally
      (cleanup-db-and-drop conn db-name))))

;; Or using arity-0 (for temporary compatibility with old fixtures):
(let [conn (initialize-db-once)]  ;; Auto-generates db-name
  ;; ... use conn)
```

**Note**: After Phase 1A, when all test fixtures are consolidated into `with-isolated-db`, the arity-0 version can be reconsidered for removal in a follow-up refactoring if desired.

---

### Alternative: Option B (Rejected)

**Option B: Remove Arity-0, Update All Callers** (Not Chosen - More Invasive):

This would require changing:
- loaders_integration_test.clj: `with-isolated-db` function (line 20)
- permutations_integration_test.clj: `initialize-db-once-fixture` function (line 17)
- db_test.clj: `initialize-db-once-fixture` function (line 20)
- equivalence_test.clj: `initialize-db-once-fixture` function (line 17)

Rejected because these fixture functions are being eliminated in Phase 1A anyway, so there's no value in updating them - better to leave them alone and focus on the centralization.
