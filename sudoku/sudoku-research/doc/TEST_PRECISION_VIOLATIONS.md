# Test Precision Violations Report

## Executive Summary

This document outlines every violation of the Test Precision rules found across the sudoku-research test suite. Each violation is documented with the specific rule(s) violated, the problematic code pattern, and a detailed refactoring strategy.

**Total Files Reviewed**: 21 test files (13 unit tests, 9 integration tests)

---

## Test Precision Rules Reference

1. **Single Scenario**: Each test tests exactly one scenario
2. **Explicit I/O**: Clear explicit inputs and outputs
3. **No Conditionals**: No `if`, `when`, or conditional blocks (except `try/catch` for error handling)
4. **Exact Assertions**: Use equals only, no conditional assertions
5. **Full Collection Validation**: Exact count + exact value of each element
6. **Error Capture**: Use mock console pattern, don't swallow errors
7. **Documentation**: Precise docs with scenario description and step comments

---

# UNIT TESTS VIOLATIONS

## 1. core_test.clj

### Violation 1.1: `parse-no-args-test` - Incomplete Collection Validation (Rule 5)

**Location**: Lines 10-13

**Issue**: Test validates only the existence of keys in a map, not the exact structure or all key-value pairs.

```clojure
(deftest ^:unit parse-no-args-test
  (testing "No arguments uses defaults"
    (let [result (core/validate-args [])]
      (is (contains? result :options))
      (is (= "sudoku/sudoku-clj/resources/solutions" (:dir (:options result)))))))
```

**Violations**:
- Rule 5: Not validating the exact structure of the result map (what other keys exist?)
- Rule 7: Insufficient documentation of the expected structure

**Refactoring Strategy**:
- Validate the exact keys in the result map
- Validate the exact keys in the options submaps
- Validate all expected values, not just the dir
- Add comments explaining the expected structure
- Assert the complete structure with exact equality

---

### Violation 1.2: `parse-custom-dir-test` through `parse-combined-options-test` - Partial Expectations (Rule 4, 5)

**Location**: Lines 15-48

**Issues**: These tests validate individual fields without validating:
- Whether unexpected fields exist in the returned map
- The complete structure of nested maps
- The exact count and values of all returned fields

**Example from parse-custom-dir-test**:
```clojure
(let [result (core/validate-args ["--dir" "/custom/path"])]
  (is (= "/custom/path" (:dir (:options result)))))
```

**Violations**:
- Rule 4: Only asserting one field, not the complete equality
- Rule 5: Not validating all keys/values in the options map

**Refactoring Strategy**:
For each test:
1. Define the expected COMPLETE result structure (not just partial)
2. Assert exact equality against the entire result map
3. Or break into multiple focused tests if different branches produce different complete structures
4. Document what the complete expected structure is

---

### Violation 1.3: `usage-text-completeness-test` - Partial Expectations (Rule 4, 5)

**Location**: Lines 54-59

**Issue**: Test only checks that certain substrings exist in usage text, not exact content.

```clojure
(deftest ^:unit usage-text-completeness-test
  (testing "Usage text includes all major sections"
    (let [usage-text (core/usage "OPTIONS SUMMARY")]
      (is (str/includes? usage-text "Sudoku Research Puzzle Loader"))
      (is (str/includes? usage-text "USAGE"))
      (is (str/includes? usage-text "OPTIONS"))
      (is (str/includes? usage-text "EXAMPLES"))
      (is (str/includes? usage-text "DATABASE CONFIG")))))
```

**Violations**:
- Rule 4: Using `str/includes?` instead of exact equality
- Rule 5: Only checking presence of substrings, not the exact usage text output

**Refactoring Strategy**:
1. Store the exact expected usage text (or a snapshot of it)
2. Assert exact equality: `(is (= expected-text usage-text))`
3. If the usage text is very long, consider:
   - Breaking it into multiple smaller functions that are tested exactly
   - Creating a separate file with the expected usage text
   - Testing each section independently with exact assertions

---

### Violation 1.4: `usage-includes-example-commands-test` - Partial Expectations (Rule 4, 5)

**Location**: Lines 61-66

**Same issue as Violation 1.3**: Using `str/includes?` for substring matching instead of exact equality.

**Refactoring Strategy**: Same as 1.3

---

## 2. loaders_test.clj

### Violation 2.1: `count-clues-test` - Multiple Separate Deftests (Rule 1)

**Location**: Lines 12-28 (three separate deftests)

**Issue**: Three related count-clues tests are defined as separate `deftest`s instead of consolidated into one `deftest` with multiple `testing` blocks sharing a let block for test data.

**Current Pattern** (WRONG):
```clojure
(deftest ^:unit count-clues-test
  (testing "Count non-zero digits..."
    (is (= 0 (loaders/count-clues "000...")))
    ...))

(deftest ^:unit count-clues-only-counts-nonzero-test
  (testing "Only count non-zero digits"
    ...))

(deftest ^:unit count-clues-single-cell-test
  (testing "Single clue"
    ...))
```

**Violations**:
- Rule 1: Related scenarios are split across multiple deftests instead of being consolidated

**Refactoring Strategy** (CORRECT):
```clojure
(deftest ^:unit count-clues-test
  (let [puzzle-empty "000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        puzzle-full "123456789123456789123456789123456789123456789123456789123456789123456789123456789"
        puzzle-partial "530070000600195000098000060800060003400803001700020006060000280000419005000080079"]
    (testing "Count non-zero digits in puzzle string"
      (is (= 0 (loaders/count-clues puzzle-empty)))
      (is (= 81 (loaders/count-clues puzzle-full)))
      (is (= 30 (loaders/count-clues puzzle-partial))))
    (testing "Only count non-zero digits"
      (is (= 30 (loaders/count-clues puzzle-partial)))
      (is (< (loaders/count-clues puzzle-partial) 81)))
    (testing "Single clue"
      (is (= 1 (loaders/count-clues "100000000000000000000000000000000000000000000000000000000000000000000000000000000")))
      (is (= 1 (loaders/count-clues "000000000000000000000000000000000000000000000000000000000000000000000000000000009"))))))
```

**Action**: Delete the redundant `count-clues-only-counts-nonzero-test` and `count-clues-single-cell-test` deftests.

---

### Violation 2.2: `count-clues-only-counts-nonzero-test` - REDUNDANT TEST

**Location**: Lines 15-19

**Status**: REMOVE THIS TEST

**Reason**: This test is entirely redundant with Violation 2.1. The scenarios in 2.1 already validate:
- Empty puzzle (0 clues)
- Full solution (81 clues)
- Valid puzzle (30 clues)

Additionally, the second assertion `(is (< ... 81))` is logically obvious (if count is 30, it's obviously less than 81).

**Recommendation**: Delete this test entirely and rely on the comprehensive `count-clues-test` from Violation 2.1.

---

### Violation 2.3: `insert-puzzles-batch-success-test` - Incomplete Validation (Rule 5)

**Location**: Lines 39-49

**Issue**: Validates individual fields but doesn't validate complete structure (no unexpected fields).

**Current Pattern**:
```clojure
(let [result (loaders/insert-puzzles-batch db 1 puzzles)]
  (is (= 2 (:inserted result)))
  (is (= 0 (:skipped result)))
  (is (= 0 (:errors result))))
```

**Refactoring Strategy**:
For large maps, use this pattern to validate structure AND values while maintaining readable error messages:

```clojure
(let [result (loaders/insert-puzzles-batch db 1 puzzles)
      {:keys [inserted skipped errors]} result]
  ;; Validate no unexpected keys
  (is (= #{:inserted :skipped :errors} (set (keys result))))
  ;; Validate exact values
  (is (= 2 inserted))
  (is (= 0 skipped))
  (is (= 0 errors)))
```

This approach:
1. Validates the exact set of keys (no extra fields)
2. Extracts values for readability
3. Asserts exact values
4. Maintains clear error messages if any value is wrong

---

### Violation 2.4: `insert-puzzles-batch-with-errors-test` - VALID PATTERN (Rule 5)

**Location**: Lines 72-86

**Status**: VALID PATTERN

**Current Pattern** (CORRECT):
```clojure
(is (= 3 (count logs)) "Should have logged exactly 3 error messages")
(is (every? #(= % "[ERROR] Inserting puzzle: DB error") logs)
    "All logged messages should be the exact error message"))
```

This pattern is valid because:
1. The first assertion validates the **exact count** of logs (Rule 5)
2. The second assertion validates that **every element** matches exactly (the predicate `#(= %)` is an exact equality check, not a type check)
3. Together, they achieve both count and value validation
4. This approach is more readable than a single vector equality when logs might be long

No refactoring needed. This satisfies Rule 5.

---

## 3. permutations_test.clj

### Violation 3.1: `resolve-transform-id-with-invalid-transform-key-test` - Incomplete Exception Validation (Rule 4, 5)

**Location**: Lines 101-108

**Issue**: Test uses try/catch but doesn't validate the exact exception class or complete ex-data.

```clojure
(try
  (perms/resolve-transform-id mock-db {:transform-key invalid-key})
  (catch Exception e
    (let [data (ex-data e)]
      (is (= (:transform-key data) invalid-key)))))
```

**Violations**:
- Rule 4: Not validating the **exact exception class** (uses generic `Exception`)
- Rule 5: Not validating the **complete ex-data structure** (only checks one key)
- Rule 4: Not validating the **exact error message**
- Rule 7: No documentation of what exception is expected

**Refactoring Strategy**:
1. Catch `Throwable` and validate the exact exception type:
   ```clojure
   (try
     (perms/resolve-transform-id mock-db {:transform-key invalid-key})
     (is false "Should have thrown exception")
     (catch Throwable e
       ;; Exact exception class assertion (Rule 4)
       (is (= (type e) clojure.lang.ExceptionInfo))
       ;; Exact message assertion (Rule 4)
       (is (= (ex-message e) "Transform key is invalid: invalid-format"))
       ;; Complete ex-data assertion (Rule 5)
       (is (= (ex-data e) {:transform-key invalid-key :reason "invalid format"}))))
   ```
2. Document what exception and data are expected

**Refactoring Strategy**:
1. Validate the **exact exception class** (not generic Exception):
   ```clojure
   (catch ExceptionInfo e  ;; or whatever the exact type is
   ```
2. Validate the **complete ex-data structure** (not partial):
   ```clojure
   (is (= (ex-data e) {:transform-key invalid-key :reason "..."}))
   ```
3. Validate the **exact error message**:
   ```clojure
   (is (= (ex-message e) "Exact expected error message"))
   ```
4. Add documentation of what exception and data are expected

---

### Violation 3.2: `resolve-transform-id-missing-both-test` - Incomplete Exception Validation (Rule 4, 5)

**Location**: Lines 110-118

**Same issue as 3.1**: Doesn't validate exact exception class or complete structure.

**Refactoring Strategy**: Same pattern as 3.1:
```clojure
(try
  (perms/resolve-transform-id mock-db {})
  (is false "Should have thrown exception")
  (catch Throwable e
    ;; Exact exception class assertion (Rule 4)
    (is (= (type e) clojure.lang.ExceptionInfo))
    ;; Exact message assertion (Rule 4)
    (is (= (ex-message e) "Must provide either :transform-id or :transform-key"))
    ;; Complete ex-data assertion (Rule 5)
    (is (= (ex-data e) {:provided-keys []}))))
```

---

### Violation 3.3: `stream-permutations-shape-test` - Incomplete Collection Validation (Rule 5)

**Location**: Lines 36-48

**Issue**: Only validates the FIRST candidate in the collection, not all candidates; doesn't validate all keys in each map; uses a validation function instead of exact equality.

```clojure
(let [first-cand (first candidates)]
  (is (= 1 (:rotation-id first-cand)))
  (is (= identity-order (:row-order first-cand)))
  (is (= identity-order (:column-order first-cand)))
  (is (= identity-symbols (:symbol-translation first-cand)))
  (is (db-validation/valid-transform-key? (:transform-key first-cand))))
```

**Violations**:
- Rule 5: Only validates the first candidate; what about the rest?
- Rule 5: Only validates 5 fields per candidate; what about other keys?
- Rule 4: Last assertion uses a validation function instead of exact equality

**Refactoring Strategy**:
Validate the complete collection with exact equality:

```clojure
(let [candidates (stream-permutations ...)
      expected [{:rotation-id 1 :row-order identity-order :column-order identity-order :symbol-translation identity-symbols :transform-key expected-transform-key}
                 {:rotation-id 2 :row-order [...] :column-order [...] :symbol-translation [...] :transform-key [...]}
                 ...]]
  ;; Validate exact equality on complete collection (count + keys + values for every candidate)
  (is (= expected candidates)))
```

This validates:
1. Exact number of candidates (count)
2. Every candidate has exactly the expected keys (no surprises)
3. Every candidate has exactly the expected values

---

## 4. puzzle_test.clj

### Violation 4.1-4.3: `apply-rotation-*-test` - Multiple Separate Deftests (Rule 1)

**Location**: Lines 31-55 (four separate deftests for rotations)

**Issue**: Four related rotation tests are defined as separate `deftest`s instead of consolidated into one `deftest` with multiple `testing` blocks.

**Current Pattern** (WRONG):
```clojure
(deftest ^:unit apply-rotation-identity-test
  (testing "Identity rotation (0°) returns same puzzle"
    ...))

(deftest ^:unit apply-rotation-90-test
  (testing "90° clockwise rotation..."
    ...))

(deftest ^:unit apply-rotation-180-test
  (testing "180° rotation"
    ...))

(deftest ^:unit apply-rotation-270-test
  (testing "270° rotation"
    ...))
```

**Violations**:
- Rule 1: Related rotation scenarios are split across multiple deftests instead of being consolidated

**Refactoring Strategy** (CORRECT):
```clojure
(deftest ^:unit apply-rotation-test
  (let [puzzle-rotated-90 (puzzle/apply-rotation test-puzzle 1)
        puzzle-rotated-180 (puzzle/apply-rotation test-puzzle 2)
        puzzle-rotated-270 (puzzle/apply-rotation test-puzzle 3)]
    (testing "Identity rotation (0°) returns same puzzle"
      (is (= (puzzle/apply-rotation test-puzzle 0) test-puzzle)))
    (testing "90° clockwise rotation produces valid 81-char string"
      (is (= (count puzzle-rotated-90) 81)))
    (testing "180° rotation produces valid 81-char string"
      (is (= (count puzzle-rotated-180) 81)))
    (testing "270° rotation produces valid 81-char string"
      (is (= (count puzzle-rotated-270) 81)))
    (testing "Four 90° rotations return to original"
      (let [rotated-4x (-> test-puzzle
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1)
                           (puzzle/apply-rotation 1))]
        (is (= rotated-4x test-puzzle))))))
```

**Action**: Delete the redundant `apply-rotation-90-test`, `apply-rotation-180-test`, and `apply-rotation-270-test` deftests. Keep only the consolidated `apply-rotation-test` with all scenarios.

---

### Violation 4.4: `apply-row-ordering-*-test` - Multiple Separate Deftests (Rule 1)

**Location**: Lines 63-84 (three separate deftests)

**Issue**: Three related row ordering tests are defined as separate `deftest`s instead of consolidated.

**Current Pattern** (WRONG):
```clojure
(deftest ^:unit apply-row-ordering-identity-test ...)
(deftest ^:unit apply-row-ordering-swap-test ...)
(deftest ^:unit apply-row-ordering-permutation-test ...)
```

**Violations**:
- Rule 1: Related scenarios are split across multiple deftests

**Refactoring Strategy** (CORRECT):
```clojure
(deftest ^:unit apply-row-ordering-test
  (let [grid (puzzle/puzzle-string->grid test-puzzle)
        row0 (first grid)
        row1 (second grid)]
    (testing "Identity row ordering returns same puzzle"
      (is (= (puzzle/apply-row-ordering test-puzzle [0 1 2 3 4 5 6 7 8]) test-puzzle)))
    (testing "Swap rows 0 and 1"
      (let [result (puzzle/apply-row-ordering test-puzzle [1 0 2 3 4 5 6 7 8])
            result-grid (puzzle/puzzle-string->grid result)]
        (is (= (get result-grid 1) row0))
        (is (= (get result-grid 0) row1))))
    (testing "Complex row permutation"
      (let [result (puzzle/apply-row-ordering test-puzzle [8 7 6 5 4 3 2 1 0])]
        (is (= (count result) 81))
        (let [twice-reversed (puzzle/apply-row-ordering result [8 7 6 5 4 3 2 1 0])]
          (is (= twice-reversed test-puzzle)))))))
```

**Action**: Delete the redundant `apply-row-ordering-identity-test`, `apply-row-ordering-swap-test`, and `apply-row-ordering-permutation-test` deftests.

---

### Violation 4.5: `apply-column-ordering-*-test` - Multiple Separate Deftests (Rule 1)

**Location**: Lines 86-107 (three separate deftests)

**Issue**: Three related column ordering tests are defined as separate `deftest`s instead of consolidated.

**Current Pattern** (WRONG):
```clojure
(deftest ^:unit apply-column-ordering-identity-test ...)
(deftest ^:unit apply-column-ordering-swap-test ...)
(deftest ^:unit apply-column-ordering-permutation-test ...)
```

**Refactoring Strategy** (CORRECT):
Consolidate into single `deftest ^:unit apply-column-ordering-test` with three `testing` blocks (identity, swap, permutation) following the same pattern as Violation 4.4.

**Action**: Delete the redundant separate deftests.

---

### Violation 4.6: `apply-symbol-translation-swap-test` - Conditional Assertions (Rule 3)

**Location**: Lines 99-112

**Issue**: Uses `doseq` with `cond` blocks to conditionally execute different assertions based on original value.

```clojure
(doseq [r (range 9) c (range 9)]
  (let [orig-val (get-in orig-grid [r c])
        result-val (get-in result-grid [r c])]
    (cond
      (= orig-val 1) (is (= result-val 2))
      (= orig-val 2) (is (= result-val 1))
      :else (is (= result-val orig-val)))))
```

**Violations**:
- Rule 3: Uses `cond` block to conditionally execute different assertions
- Rule 5: Not validating the complete transformed grid at once

**Refactoring Strategy**:
1. Build the exact expected grid by applying the transformation to each cell
2. Assert exact equality on the entire grid
3. Or use multiple `testing` blocks for each transformation rule with specific examples

Example:
```clojure
(testing "Symbol translation swaps 1 and 2"
  (let [result-grid (puzzle/puzzle-string->grid (puzzle/apply-symbol-translation result [2 1 0 ...]))]
    (is (= (get-in result-grid [0 0]) 2))  ;; If orig was 1
    (is (= (get-in result-grid [0 1]) 1))  ;; If orig was 2
    ...))
```
2. Assert exact equality: `(is (= expected-grid result-grid))`
3. This avoids conditionals and validates everything at once

---

## 5. analysis_test.clj

### Violation 5.1: `deduplication-guard-prevents-duplicate-processing-test` - Multiple Scenarios & Incomplete Validation (Rule 1, 5)

**Location**: Lines 12-63

**Issues**: 
- Test has multiple scenarios (dedup detection, mocking setup, isolated testing)
- Very complex setup with mocks that aren't actually used
- Only validates processed-ids set operations, not the actual deduplication logic

```clojure
(let [first-check (contains? @processed-ids puzzle-id)]
  (is (false? first-check))
  (swap! processed-ids conj puzzle-id)
  (let [second-check (contains? @processed-ids puzzle-id)]
    (is (true? second-check) "Duplicate detection should identify same puzzle ID")))
```

**Violations**:
- Rule 1: Test setup and actual testing are mixed
- Rule 5: Only tests the atom/set behavior, not the actual deduplication logic
- Rule 7: Excessive documentation without clear purpose

**Refactoring Strategy**:
1. This test is testing set operations, not deduplication
2. Split or rename to be clear: `deduplication-processed-ids-tracks-puzzles-test`
3. Simplify: Remove the mock setup that isn't used
4. Focus on exact scenario: "An empty set contains no IDs, adding an ID makes it contain that ID"
5. Test the actual `analyze-clue-count!` function separately with real deduplication behavior

---

## 6. db/queries_test.clj

### Violation 6.1: `count-original-puzzles-by-clue-count-test` - Incomplete Collection Validation (Rule 5)

**Location**: Lines 16-28

**Issue**: Only validates that count equals 3 and checks some fields, not the complete structure.

```clojure
(let [result (db-qry/count-original-puzzles-by-clue-count :mock-db)]
  (is (= (count result) 3))
  (is (= (map :clue-count result) [25 27 30]))
  (is (= (map :count result) [100 150 200])))
```

**Violations**:
- Rule 5: Validates count and partial field maps, not the exact complete rows

**Refactoring Strategy**:
1. Define exact expected result:
   ```clojure
   (let [expected [{:clue-count 25 :count 100}
                   {:clue-count 27 :count 150}
                   {:clue-count 30 :count 200}]]
   ```
2. Assert exact equality: `(is (= expected result))`

---

### Violation 6.2: `query-jdbc-error-test` - Imprecise Exception Validation (Rule 4)

**Location**: Lines 95-101

**Issue**: Uses `thrown-with-msg?` which performs partial regex validation instead of exact assertion.

```clojure
(is (thrown-with-msg? Exception #"Error executing"
      (db-qry/count-original-puzzles-by-clue-count :mock-db)))
```

**Violations**:
- Rule 4: Using regex pattern match instead of exact message assertion
- Rule 4: Catching generic `Exception` instead of exact exception class
- Rule 5: Not validating the complete exception ex-data

**Refactoring Strategy**:
1. Use try/catch to validate the **exact exception class, message, and ex-data**:
   ```clojure
   (try
     (db-qry/count-original-puzzles-by-clue-count :mock-db)
     (is false "Should have thrown exception")
     (catch Throwable e
       ;; Exact exception class assertion (Rule 4)
       (is (= (type e) JdbcException))  ;; Or actual exception type
       ;; Exact message assertion (Rule 4)
       (is (= (ex-message e) "Error executing query: Connection timeout"))
       ;; Exact ex-data assertion (Rule 5)
       (is (= (ex-data e) {:query-type :count-original-puzzles :error-code 1234}))))
   ```
2. Document what specific error condition should occur
3. Validate both the message AND the exception class exactly

---

## 7. data/validation_test.clj

### Violation 7.1: `valid-transform-key-order-permutations-test` - Incomplete Validation (Rule 5)

**Location**: Lines 78-85

**Issue**: Only checks that certain keys return true, not comprehensive coverage of valid/invalid inputs across all "blocks" of the transform key.

**Violations**:
- Rule 5: No validation of invalid cases or edge cases
- Rule 7: No documentation of what makes a key valid

**Refactoring Strategy**:
Allow for a looser definition of "comprehensive" given there are billions of valid values. Test each "block" with a handful of valid AND invalid scenarios under a single `deftest`. Use multiple `testing` blocks for:

1. **Rotation block validation**: Test '00', '90' (valid) vs '0', '37' (invalid)
2. **Row order permutations**: Test identity, rotation, mirror (valid) vs invalid patterns
3. **Column order permutations**: Similar patterns as row order
4. **General invalid cases**: Wrong length, alpha chars, repeated digits, non-alphanumeric, wrong separators

This approach:
- Uses a single `deftest` with multiple `testing` blocks
- Tests each "block" with both valid and invalid cases
- Documents what patterns are valid and invalid
- Maintains readability while being comprehensive

---

## 8. file/io_test.clj

### Violation 8.1: `read-json-file-not-found-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 14-23

**Issue**: Uses try/catch but validates with type checks instead of exact assertions.

```clojure
(try
  (file-io/read-json-file "/nonexistent/path/file.json")
  (is false "Should have thrown exception")
  (catch Exception e
    (let [data (ex-data e)]
      (is (string? (ex-message e)))  ;; WRONG: Only checks type, not exact value
      ...)))
```

**Violations**:
- Rule 4: Using `(string? ...)` instead of exact assertion on message
- Rule 4: Catching generic `Exception` instead of exact exception class
- Rule 5: Not validating the complete ex-data structure
- Rule 7: No documentation of expected error message and structure

**Refactoring Strategy**:
1. Catch `Throwable` and validate the exact exception type:
   ```clojure
   (try
     (file-io/read-json-file "/nonexistent/path/file.json")
     (is false "Should have thrown exception")
     (catch Throwable e
       ;; Exact exception class assertion (Rule 4)
       (is (= (type e) clojure.lang.ExceptionInfo))
       ;; Exact error message assertion (Rule 4)
       (is (= (ex-message e) "File not found: /nonexistent/path/file.json"))
       ;; Complete ex-data assertion (Rule 5)
       (is (= (ex-data e) {:file-path "/nonexistent/path/file.json"}))))
   ```
2. Document the expected exception structure in the test docstring

---

### Violation 8.2: `read-json-file-includes-file-path-in-message-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 25-30

**Same issue as 8.1**: Validates with type checks instead of exact assertions.

**Refactoring Strategy**: Same pattern as 8.1

---

### Violation 8.3: `list-json-files-not-directory-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 32-41

**Same issue as 8.1**: Validates with type checks instead of exact assertions.

**Refactoring Strategy**: Same pattern as 8.1

---

### Violation 8.4: `list-json-files-nonexistent-path-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 43-52

**Same issue as 8.1**: Validates with type checks instead of exact assertions.

**Refactoring Strategy**: Same pattern as 8.1

---

## 9. db/mutations_test.clj

### Violation 9.1: `insert-original-puzzle-param-validation-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 65-70

**Issue**: Uses `thrown-with-msg?` which is partial regex validation, not exact assertion.

```clojure
(is (thrown-with-msg? Exception #"Parameter mismatch"
      (db-mut/insert-original-puzzle!
        :mock-db
        {:puzzle "530070000..."})))
```

**Violations**:
- Rule 4: Using regex pattern match instead of exact message
- Rule 4: Catching generic `Exception` instead of exact class
- Rule 5: Not validating the complete exception structure

**Refactoring Strategy**:
1. Catch `Throwable` and validate the exact exception type:
   ```clojure
   (try
     (db-mut/insert-original-puzzle! :mock-db {:puzzle "530070000..."})
     (is false "Should have thrown exception")
     (catch Throwable e
       ;; Exact exception class assertion (Rule 4)
       (is (= (type e) clojure.lang.ExceptionInfo))
       ;; Exact message assertion (Rule 4)
       (is (= (ex-message e) "Parameter mismatch: missing required keys [solution clue-count source-file-id]"))
       ;; Complete ex-data assertion (Rule 5)
       (is (= (ex-data e) {:provided-keys [:puzzle] :missing-keys [:solution :clue-count :source-file-id]}))))
   ```
2. Document what parameters are required and what error occurs when they're missing

---

### Violation 9.2: `insert-original-puzzle-jdbc-error-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 72-80

**Same issue as 9.1**: Uses `thrown-with-msg?` for partial validation instead of exact assertion.

**Refactoring Strategy**: Same pattern as 9.1:
```clojure
(try
  (db-mut/insert-original-puzzle! :mock-db {:puzzle "..." :solution "..." :clue-count 25 :source-file-id 1})
  (is false "Should have thrown exception")
  (catch Throwable e
    ;; Exact exception class assertion (Rule 4)
    (is (= (type e) SQLException))  ;; Or actual exception type
    ;; Exact message assertion (Rule 4)
    (is (= (ex-message e) "Connection refused"))
    ;; Complete ex-data assertion if applicable (Rule 5)
    (is (= (ex-data e) {:error-type :connection-refused}))))
```

---

## 10. db/helpers_test.clj

### Violation 10.1: `execute-jdbc-call-mode-dispatch-test` - Incomplete Validation (Rule 5)

**Location**: Lines 156-172

**Issue**: Only counts calls, doesn't validate the exact arguments or return values.

```clojure
(db-helpers/execute-jdbc-call :one :db [:sql :param1] {:opts true})
(is (= (count @one-calls) 1))
```

**Violations**:
- Rule 5: Only validates call count, not the exact arguments passed

**Refactoring Strategy**:
Follow the pattern from Violation 2.3:

```clojure
(db-helpers/execute-jdbc-call :one :db [:sql :param1] {:opts true})
(let [calls @one-calls
      [db sql opts] (first calls)]
  ;; Validate exact call count
  (is (= 1 (count calls)))
  ;; Validate exact arguments
  (is (= db :db))
  (is (= sql [:sql :param1]))
  (is (= opts {:opts true})))
```

Or more concisely:
```clojure
(is (= 1 (count @one-calls)))
(is (= [:db [:sql :param1] {:opts true}] @one-calls))
```

---

## 11. db/connection_test.clj

### Violation 11.1: `connect-test-db` - Incomplete Validation (Rule 5)

**Location**: Lines 51-58

**Issue**: Only validates that dbname was set, not the complete config returned.

```clojure
(let [ds (db-conn/connect-test-db)]
  (is (= "mock-datasource" ds))
  (is (= "sudoku_research_test" (:dbname @called-with))))
```

**Violations**:
- Rule 5: Only validates dbname, not other config keys that should be present

**Refactoring Strategy**:
1. Define expected complete config
2. Assert all config keys have expected values
3. Document what the test database override should contain

---

## 12. logging_test_helpers.clj

### Violation 12.1: `capture-logs` - Not a Test, But Incomplete Structure (Rule 5)

**Location**: Entire file

**Issue**: This is a helper function, not a test, but the returned structure is not well-documented.

**Note**: This file may not need refactoring if it's purely a utility. But if tests using it aren't validating the structure, that's a violation.

---

## 13. db_test_helpers.clj

### Violation 13.1: Same as 12.1

**Location**: Entire file

**Note**: Helper factory functions. Validate in tests that use them.

---

# INTEGRATION TESTS VIOLATIONS

## 14. loaders_integration_test.clj

### Violation 14.1: `initialize-db-once` Function - MAJOR ARCHITECTURAL ISSUE (TOP PRIORITY)

**Status**: *** CRITICAL - VERY TOP PRIORITY - FIX BEFORE OTHER WORK ***

**Issue**: The `initialize-db-once` helper function has three critical flaws that cascade problems to ALL integration tests:

#### Flaw 1: Returns array instead of map
**Current**: `[connection db-name]`
**Problem**: Caller must use positional destructuring; unclear what the array contains
**Recommended**: `{:connection connection :db-name db-name}` or return connection directly + separate tracking

#### Flaw 2: Swallows exceptions
**Current**: Wraps try/catch without re-throwing
**Problem**: 
- `initialize-db!` already prints the error and throws
- Swallowing the exception hides information from callers
- Loses the stack trace and exception details
**Recommended**: Let exceptions bubble up naturally (remove try/catch)

#### Flaw 3: Forces @db-available atom pattern
**Current**: Tests use `(if @db-available? ... (is true))`  
**Problem**:
- Creates conditional test flow (Rule 3 violation)
- Tests silently skip on database unavailability instead of failing loudly
- Makes database initialization state hidden/implicit
**Recommended**: Return actual connection object, let initialization succeed or fail explicitly

#### Impact on Violations
Fixing this cascades to simplify:
- **14.1-14.3** (loaders_integration_test): Remove @db-available? conditionals
- **15.1-15.3** (file_io_integration_test): Remove @db-available? conditionals
- **16.1-16.3** (permutations_integration_test): Remove @db-available? conditionals
- **17.1** (equivalence_test setup): Use actual connection directly
- **18.1-18.6** (db_test): Remove @db-available? conditionals

#### Refactoring Steps
1. **Rewrite `initialize-db-once`**:
   ```clojure
   (defn initialize-db-once [test-fn]
     (let [db-name (str "test_" (UUID/randomUUID))
           {:keys [connection]} (initialize-db! db-name)]
       (try
         (test-fn connection db-name)  ;; Let exceptions propagate
         (finally
           (close-db! connection)))))
   ```

2. **Update all integration tests** to use connection directly:
   ```clojure
   ;; BEFORE: conditional
   (if @db-available?
     (with-isolated-db (fn [conn] ...))
     (is true))
   
   ;; AFTER: explicit assertion at test start
   (with-isolated-db (fn [conn]
     (is conn "Database connection must be available")
     ...))
   ```

3. **Result**: Remove ~50+ @db-available? conditionals across all integration tests

---

### Violations 14.2-14.3: Deferred pending 14.1 resolution

---

## 15. file_io_test.clj (Integration)

### Violation 15.1: `read-json-file-invalid-json-test` - Imprecise Exception Validation (Rule 4, 5)

**Location**: Lines 18-27

**Issue**: Uses try/catch but doesn't validate exact exception class and ex-data.

```clojure
(try
  (file-io/read-json-file (str test-resources-path "/test-data/invalid.json"))
  (is false "Should have thrown exception")
  (catch Exception e
    (let [data (ex-data e)]
      (is (string? (ex-message e)))  ;; WRONG: Type check, not exact value
      (is (= :file-path (-> data keys first)))
      (is (string? (:file-path data)))
      (is (instance? Exception (ex-cause e))))))
```

**Violations**:
- Rule 4: Using `(string? ...)` type check instead of exact assertion on message
- Rule 4: Catching generic `Exception` instead of exact class
- Rule 5: Using `(-> data keys first)` and `instance?` checks instead of exact assertions
- Rule 4: Using `instance?` instead of exact equality for checking exception cause

**Refactoring Strategy**:
1. Catch `Throwable` and validate the exact exception type:
   ```clojure
   (try
     (file-io/read-json-file (str test-resources-path "/test-data/invalid.json"))
     (is false "Should have thrown exception")
     (catch Throwable e
       ;; Exact exception class assertion (Rule 4)
       (is (= (type e) clojure.lang.ExceptionInfo))
       ;; Exact message assertion (Rule 4)
       (is (= (ex-message e) "Invalid JSON in file: /path/to/invalid.json"))
       ;; Complete ex-data assertion (Rule 5)
       (is (= (ex-data e) {:file-path "/path/to/invalid.json"}))
       ;; Exact cause exception type assertion (Rule 4)
       (is (= (type (ex-cause e)) org.json.JSONException))))
   ```
2. Document the expected exception structure in the test docstring

### Violation 15.2: `list-json-files-valid-directory-test` - Incomplete Validation (Rule 5)

**Location**: Lines 35-42

**Issue**: Only validates properties of files, not the exact list.

```clojure
(is (every? string? result))
(is (every? #(.endsWith % ".json") result))
(is (> (count result) 0) "Should have at least one JSON file"))
```

**Violations**:
- Rule 4: Using `>` instead of exact count
- Rule 5: Not validating the exact list of files

**Refactoring Strategy**:
1. Define expected exact list of JSON files in test-data directory
2. Assert exact equality: `(is (= expected-files result))`
3. This assumes test data is stable (which it should be for integration tests)

---

### Violation 15.3: `list-json-files-mixed-files-test` - Incomplete Validation (Rule 5)

**Location**: Lines 44-53

**Same issue as 15.2**: Uses `some` and property checks instead of exact validation.

```clojure
(is (some #(.endsWith % "valid.json") result) "Should include valid.json")
(is (some #(.endsWith % "z-last.json") result) "Should include z-last.json"))
```

**Refactoring Strategy**: Same as 15.2

---

## 16. permutations_integration_test.clj

### Violation 16.1: Multiple Tests with Conditional Database Check (Rule 3)

**Location**: All tests (lines 31+)

**Issue**: All tests use `(if @db-available? ... (is true "SKIPPED: Database not available"))`

```clojure
(if @db-available?
  (let [canonical-id (ensure-canonical-id!)
        ...]
    (is ...))
  (is true "SKIPPED: Database not available"))
```

**Violations**:
- Rule 3: Using if block for conditional test logic
- Rule 7: Silently skipping with `(is true "...")` is not proper test documentation

**Refactoring Strategy**:
Replace the if block with a direct assertion on database availability. This way the test fails loudly if the database isn't available, rather than silently skipping:

```clojure
(is @db-available? "Database must be available for this test")
(let [canonical-id (ensure-canonical-id!)
      ...]
  (is ...))
```

This approach:
1. Eliminates the conditional control flow (Rule 3)
2. Fails loudly if preconditions aren't met
3. Makes test requirements explicit
4. Removes silent skipping and fake assertions

---

### Violation 16.2: `insert-permutation!-transform-key-test` - Incomplete Validation (Rule 5)

**Location**: Lines 35-42

**Issue**: Only checks that result contains `:id` key.

```clojure
(is (or (nil? result) (contains? result :id)))
```

**Violations**:
- Rule 4: Using `or` for partial validation (nullable OR has id)
- Rule 5: Not validating the exact structure

**Refactoring Strategy**:
1. Define expected result structure
2. Assert exact equality or proper nil/empty handling
3. Document what the function should return

---

### Violation 16.3: `generate-permutations-limited-test` - Incomplete Validation (Rule 5)

**Location**: Lines 44-56

**Issue**: Only validates that stats contains certain keys.

```clojure
(is (contains? stats :new))
(is (contains? stats :existing))
(is (contains? stats :errors))
```

**Violations**:
- Rule 5: Not validating the exact values of these fields

**Refactoring Strategy**:
1. Define expected stats map with exact values
2. Assert exact equality: `(is (= expected-stats stats))`

---

## 17. equivalence_test.clj

### Violation 17.1: Multiple Tests with Conditional Database Check (Rule 3)

**Location**: All tests

**Same issue as 16.1**: Using `(if @db-available? ... (is true))`

**Refactoring Strategy**: Same as 16.1 - replace the if block with a direct assertion:

```clojure
(is @db-available? "Database must be available for this test")
;; Rest of test without conditional
```

---

### Violation 17.2: `insert-and-find-equivalence-test` - Rule 4 Violations (Partial Assertions)

**Location**: Lines 49-65

**Status**: NOT multiple scenarios - this is ONE scenario with multiple steps (VALID for integration test)

**Issue**: The test structure is fine for integration testing (setup -> execute -> verify), but it violates Rule 4 (exact assertions).

```clojure
(let [orig-id (ensure-original-id! puzzle-a "equiv-a.json")
      canon-id (ensure-canonical-id! puzzle-a)
      inserted (db-mut/insert-equivalence! @conn* ...)
      found (db-qry/find-equivalence @conn* orig-id)]
  (is (some? orig-id))  ;; WRONG: type check, not exact value
  (is (some? canon-id))  ;; WRONG: type check, not exact value
  (is (or (nil? inserted) (some? (fixtures/row-id inserted))))  ;; WRONG: partial validation
  (is (some? found))  ;; WRONG: type check, not exact value
  (is (= (fixtures/original-id found) orig-id))
  (is (= (fixtures/canonical-id found) canon-id)))
```

**Violations**:
- Rule 4: Using `some?` type checks instead of exact values
- Rule 4: Using `or` for partial validation instead of exact expectation
- Rule 4: Using helper functions for assertions instead of direct comparison

**Refactoring Strategy**:
1. Keep the overall test structure (it's fine for integration)
2. Replace all `some?` with exact value assertions
3. Replace `or` logic with exact expected value
4. Validate complete equivalence record, not just helper function results

---

### Violation 17.3: `equivalence-aggregates-test` - REMOVE THIS TEST

**Location**: Lines 77-101

**Status**: Delete entirely - no replacement

**Issue**: This test is poorly structured with no clear intent:

```clojure
(let [... 
  for-canonical (db-qry/get-equivalences-for-canonical @conn* canon-a)
  by-canonical (db-qry/count-equivalences-by-canonical @conn*)
  total (db-qry/count-total-equivalences @conn*)
  class-stats (db-qry/get-equivalence-class-stats @conn*)]
  (is (vector? for-canonical))  ;; Only checks type, not values
  (is (vector? by-canonical))
  (is (number? total))
  (is (vector? class-stats)))
```

**Problems**:
- The test is attempting to verify a particular scenario, but due to poor documentation and structure, the intent is lost
- Rule 1: Tests 4 different, unrelated query functions in one test
- Rule 5: Only validates types, not actual values or structure
- Rule 7: No explanation of what "aggregates" scenario should validate

**Recommendation**:
Delete this test. Without understanding the original intent and test coverage goals, attempting to refactor or split it is like trying to reconstruct a puzzle without all pieces and without the picture. The test should be removed rather than salvaged.

---

### Violation 17.4: `processed-status-test` - Incomplete Validation (Rule 5)

**Location**: Lines 103-112

**Issue**: Only validates boolean result, not the complete state changes.

```clojure
(is (false? (db-qry/is-puzzle-processed? @conn* orig-id)))
(db-mut/insert-equivalence! @conn* {...})
(is (true? (db-qry/is-puzzle-processed? @conn* orig-id)))
```

**Violations**:
- Rule 5: Not validating that the database state actually changed correctly

**Refactoring Strategy**:
1. Query the equivalence record directly to verify it was inserted
2. Validate the complete equivalence record, not just the boolean result
3. Or create separate tests for the mutation and the query

---

## 18. db_test.clj

**Status**: All violations in this file depend on fixing Violation 14.1 (initialize-db-once)

All the conditional database check issues and test structure problems will be simplified once the database initialization is refactored.

### Violation 18.1: Deferred pending 14.1 resolution

**Note**: All @db-available? conditionals will become unnecessary once initialize-db-once returns actual connections rather than atoms.

---

### Violation 18.2: `function-definitions-test` - REMOVE THIS TEST

**Location**: Lines 24-40

**Issue**: Only validates that functions exist, not that they work correctly.

```clojure
(is (fn? db-conn/connect))
(is (fn? db-conn/close-db!))
...
```

**Recommendation**: Delete this test entirely. Namespace loading and compilation automatically validate that all functions are defined. Focus real tests on behavior, not existence.

---

### Violation 18.3: `db-config-test` - Incomplete Validation (Rule 5)

**Location**: Lines 42-47

**Issue**: Only validates some fields of config.

**Refactoring Strategy**: Use the pattern from Violation 2.3:

```clojure
(let [config db-conn/db-config
      {:keys [dbtype host port user password]} config]
  ;; Validate exact keys
  (is (= #{:dbtype :host :port :user :password ...} (set (keys config))))
  ;; Validate exact values
  (is (= "postgresql" dbtype))
  (is (= "localhost" host))
  (is (= 5432 port))
  ...)
```

---

### Violation 18.4: `connect-function-test` - Multiple Scenarios (Rule 1)

**Location**: Lines 49-52

**Issue**: Tests two scenarios in one test with partial assertions.

**Refactoring Strategy**: Use multiple testing blocks for each scenario.

---

### Violations 18.5 & 18.6: Deferred pending 14.1 resolution

**Note**: These test the integration database fixtures. Once initialize-db-once is fixed, these can be refactored to use the actual connection objects with proper assertions.

---

## 19. external/diagnostic_test.clj

**Status**: Skipped - Requires Clarification

**Reason**: The diagnostic_test.clj file appears to be a diagnostic/exploratory test file created during development. Before reviewing this file, clarify:
1. Is this file maintained as part of the test suite?
2. Are these tests run as part of CI/CD?
3. Should these tests follow the same test precision rules as the main test suite?

If this is a diagnostic utility file not part of the main test suite, it may not need to follow test precision rules.

---

## 20. external/schema_verification_test.clj

**Status**: Skipped - Requires Clarification

**Reason**: The schema_verification_test.clj file appears to be a schema verification utility. Before reviewing this file, clarify:
1. Is this file maintained as part of the test suite?
2. Are these tests run as part of CI/CD?
3. Should these tests follow the same test precision rules as the main test suite?

If this is a verification utility file not part of the main test suite, it may not need to follow test precision rules.

---

# SUMMARY BY RULE VIOLATION

## Rule 1 Violations (Single Scenario)
- analysis_test.clj: deduplication-guard-prevents-duplicate-processing-test
- loaders_test.clj: count-clues-test
- puzzle_test.clj: apply-rotation-90/180/270-tests
- data/validation_test.clj: valid-transform-key-order-permutations-test
- loaders_integration_test.clj: Multiple tests have mixed setup/testing
- permutations_integration_test.clj: insert-permutation!-transform-key-test, generate-permutations-limited-test
- equivalence_test.clj: insert-and-find-equivalence-test, equivalence-aggregates-test
- db_test.clj: connect-function-test, insert-permutation-with-transform-key-test

**Total: 13 tests**

---

## Rule 3 Violations (No Conditionals)
- puzzle_test.clj: apply-symbol-translation-swap-test (uses cond block)
- file/io_test.clj: All 4 tests using try/catch for normal flow
- loaders_integration_test.clj: All 3 tests with try/catch conditional skipping
- file_io_test.clj (integration): read-json-file-invalid-json-test
- permutations_integration_test.clj: All tests with if @db-available?
- equivalence_test.clj: All tests with if @db-available?
- db_test.clj: All tests with if @db-available?

**Total: 14+ tests**

### Important Clarification on Try/Catch

The violation is NOT the use of try/catch itself. Try/catch is allowed and necessary for testing exception behavior. The violation is:
- Using **if/when blocks** for conditional test control flow (e.g., `if @db-available?`)
- Using try/catch to skip tests based on runtime conditions instead of failing loudly

**Correct try/catch pattern** (validates exception class, message, and ex-data with exact assertions):
```clojure
(deftest exception-details-test
  "Verify exception is exact class with exact message and ex-data."
  (try
    (function-that-throws)
    ;; If we reach here, test fails (no exception thrown)
    (is false "Should have thrown exception")
    ;; Catch all Throwables to validate exact type (Rule 4)
    (catch Throwable e
      ;; Exact exception class assertion (Rule 4)
      (is (= (type e) clojure.lang.ExceptionInfo))
      ;; Exact message assertion (Rule 4) - NOT a type check
      (is (= (ex-message e) "Expected exact error message"))
      ;; Exact ex-data assertion (Rule 5) - complete structure
      (is (= (ex-data e) {:error-key "error-value"})))))
```

The key: 
- Catch `Throwable` to catch all exception types
- Assert the **exact exception class** using `(= (type e) ExpectedClass)`
- Assert the **exact error message** (not type checks with `string?`)
- Assert the **complete ex-data structure** (not partial checks)
- Do NOT use try/catch for conditional test flow or skipping tests

---

## Rule 4 Violations (Exact Assertions)
- core_test.clj: usage-text-completeness-test, usage-includes-example-commands-test (str/includes?)
- loaders_test.clj: count-clues-only-counts-nonzero-test (< instead of =)
- permutations_test.clj: stream-permutations-shape-test (using validation function)
- db/queries_test.clj: query-jdbc-error-test (thrown-with-msg?)
- file_io_test.clj (integration): list-json-files-valid-directory-test (> instead of =)
- permutations_integration_test.clj: insert-permutation!-transform-key-test (or logic)
- equivalence_test.clj: insert-and-find-equivalence-test (some?, or, helper functions)
- db_test.clj: connect-function-test (some?), insert-permutation-with-transform-key-test (or, some?)

**Total: 11+ tests**

---

## Rule 5 Violations (Full Collection Validation)
- core_test.clj: parse-no-args-test, all parse-* tests, usage tests (2.1-2.4)
- loaders_test.clj: count-clues-test, count-clues-only-counts-nonzero-test (2.1-2.2), insert-puzzles-batch-* tests (2.3-2.4)
- permutations_test.clj: stream-permutations-shape-test (3.3)
- puzzle_test.clj: apply-rotation-*, apply-row-ordering-swap-test, apply-column-ordering-swap-test, apply-symbol-translation-swap-test (4.1-4.6)
- db/queries_test.clj: count-original-puzzles-by-clue-count-test, all query tests (6.1)
- db/helpers_test.clj: execute-jdbc-call-mode-dispatch-test (10.1)
- db/connection_test.clj: connect-test-db (11.1)
- file_io_test.clj (integration): list-json-files-valid-directory-test, list-json-files-mixed-files-test (15.2-15.3)
- permutations_integration_test.clj: insert-permutation!-transform-key-test, generate-permutations-limited-test (16.2-16.3)
- equivalence_test.clj: All assertion tests (17.2-17.4)
- db_test.clj: db-config-test, connect-function-test, all remaining tests (18.3-18.6)

**Total: 35+ tests**

---

## Rule 6 Violations (Error Capture)
- permutations_test.clj: resolve-transform-id-with-invalid-transform-key-test, resolve-transform-id-missing-both-test (3.1-3.2)
- db/queries_test.clj: query-jdbc-error-test (6.2)
- db/mutations_test.clj: insert-original-puzzle-param-validation-test, insert-original-puzzle-jdbc-error-test (9.1-9.2)

**Total: 6 tests**

---

## Rule 7 Violations (Documentation)
- Most tests lack detailed step-by-step comments
- Many tests lack clear natural language scenario descriptions
- Many tests lack explanation of why certain assertions matter

**Total: ~50+ tests**

---

# STATISTICS

| Rule | Violations | Severity |
|------|-----------|----------|
| Rule 1 (Single Scenario) | 13 | High |
| Rule 2 (Explicit I/O) | 0 | N/A |
| Rule 3 (No Conditionals) | 14+ | Critical |
| Rule 4 (Exact Assertions) | 11+ | High |
| Rule 5 (Full Collection Validation) | 35+ | High |
| Rule 6 (Error Capture) | 6 | Medium |
| Rule 7 (Documentation) | 50+ | Medium |

**Total Individual Violations: 129+**

---

# REFACTORING PRIORITIES

## Phase 1: Critical (Rule 3 & Architectural)
Focus on ARCHITECTURAL FIX FIRST, then remove remaining conditional control flow.

### Phase 1A: VERY TOP PRIORITY - Violation 14.1 (Architecture)
**Status**: Must be completed FIRST before Phase 1B and 2

**Task**: Rewrite `initialize-db-once` function (in db_test_helpers.clj or similar):
- Return actual connection object instead of [array] or atom
- Let exceptions propagate naturally (remove try/catch swallowing)
- Eliminate @db-available atom pattern that forces conditionals

**Impact**: Fixes Violations 14.1-14.3, 15.1-15.3, 16.1-16.3, 17.1, 18.1 (50+ @db-available? conditionals removed)

**Estimated Effort**: 1-2 hours - CRITICAL PATH FOR ALL INTEGRATION TESTS

---

### Phase 1B: Remaining Rule 3 Violations
Focus on removing conditional control flow from tests.

**Affected Violations**: 4.6, 8.1-8.4, 14.1-14.3 (after 1A), 15.1 (after 1A), 16.1 (after 1A), 17.1 (after 1A), 18.1 (after 1A)

1. After completing Phase 1A, replace all `if @db-available?` conditionals with direct assertions:
   ```clojure
   ;; Instead of: (if @db-available? ... (is true "SKIPPED"))
   ;; Use: (is conn "Database connection must be available")
   ```
   This eliminates the conditional control flow and makes test preconditions explicit.

2. Fix try/catch exception testing patterns in file I/O tests (8.1-8.4, 15.1) and loaders tests (14.1-14.3):
   - **DO NOT use** try/catch for skipping tests or conditional test flow
   - **DO use** try/catch properly to validate exceptions with exact assertions:
     ```clojure
     (try
       (function-that-throws)
       (is false "Should have thrown")
       (catch Throwable e
         (is (= (type e) ExpectedClass))
         (is (= (ex-message e) "exact message"))
         (is (= (ex-data e) {...}))))
     ```

3. Remove `cond` blocks in test assertions (4.6) - replace with exact equality on transformed data

Estimated: 13+ tests

## Phase 2: High Priority (Rules 1, 4, 5)
Focus on test decomposition and exact assertions. Depends on Phase 1A completion.

**Affected Violations (Rule 1)**: 2.1, 4.1-4.3, 5.1, 7.1, 16.2, 17.2-17.3, 18.4, 18.6

**Affected Violations (Rule 4)**: 1.3-1.4, 2.2, 3.3, 6.2, 8.1-8.4, 9.1-9.2, 15.2-15.3, 16.2, 17.2, 18.4-18.6

**Affected Violations (Rule 5)**: 1.1-1.2, 2.1, 2.3-2.4, 3.3, 4.1-4.6, 5.1, 6.1, 10.1, 11.1, 14.2-14.3, 15.2-15.3, 16.2-16.3, 17.2-17.4, 18.3-18.6

1. Split multi-scenario tests into individual tests (affected: 2.1, 4.1-4.3, 5.1, 7.1, 16.2, 17.2-17.3, 18.4, 18.6)
2. Replace partial assertions with exact equality (affected: 1.3-1.4, 2.2, 3.3, 6.2, 9.1-9.2, 15.2-15.3, 18.4-18.6)
3. Validate complete structures, not partial properties (affected: all Rule 5 violations)

Estimated: 50+ tests

## Phase 3: Documentation (Rule 7)
Add comprehensive documentation to all tests. Can proceed in parallel with Phase 2.

**Affected Violations**: All test files (widespread documentation gaps)

1. Add scenario descriptions in natural language to all tests
2. Add step-by-step comments explaining what each assertion validates
3. Document why each assertion matters and what the expected behavior is

Estimated: 50+ tests

## Phase 4: Required (Rule 6 - Error Capture)
Improve error testing patterns to properly capture and validate exceptions. Depends on Phase 1B completion.

**Affected Violations**: 3.1-3.2, 6.2, 9.1-9.2

1. Validate complete exception structures (types, messages, ex-data)
2. Test error conditions thoroughly with exact assertions

Estimated: 6 tests

---

# END OF REPORT

**Generated**: 2026-05-25  
**Total Tests Reviewed**: 21 files  
**Estimated Refactoring Effort**: Phase 1A (critical path), then Phases 1B-4, affecting ~100+ tests  
**Critical Path**: Phase 1A (Violation 14.1) must be completed FIRST for Phase 1B and 2 to proceed efficiently
