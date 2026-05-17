# Clojure Development Patterns & Gotchas

This document tracks verified patterns, gotchas, and solutions discovered during actual Clojure development, specifically from the sudoku-clj solver project.

**Related:** See [reference.md](reference.md) for the comprehensive language reference covering core functions and data structures.

---

## Quick Issue Reference

| Issue | Symptom | Solution | Prevention |
|-------|---------|----------|-----------|
| Function definition order | `CompilerException: Unable to resolve symbol` | Define dependencies before usage | Plan file structure, use helpers at bottom |
| Tuple unpacking in `some` | `Arity mismatch` on `some` lambda | Use `fn [[x y]]` not `fn [x y]` | Always double-bracket tuple destructuring |
| Candidates grid caching | Grid lookup fails or indices wrong | Build candidates grid first, then use it | Test with smaller datasets first |
| Invalid puzzle strings | `IndexOutOfBoundsException` in parse | Use 81-character strings, all digits | Validate input in tests |
| Immutability overhead | Performance degradation on large grids | Cache intermediate results | Profile before optimizing |
| Set difference performance | Slowdown on large candidate sets | Use candidates grid cache | Measure bottlenecks with `time` |
| Lazy sequences | Out of memory on full dataset | Force evaluation or chunk processing | Use `doseq` for side effects, not `map` |
| Recursion depth | `StackOverflowException` | Use `loop`/`recur` for tail recursion | Avoid deep recursion, use iteration |
| UTF-8 BOM in .clj files | Reader/parser errors, weird `ns` form issues | Remove BOM with editor settings or script | Save files as UTF-8 without BOM |

---

## Critical Patterns

### 1. Function Definition Order Matters ⚠️

**Issue**: In Clojure, unlike JavaScript, functions must be defined before they're used. There's no hoisting.

```clojure
; ❌ WRONG: get-candidates not defined yet
(defn apply-constraints [grid]
  (filter #(= (count (get-candidates grid %)) 1) cells))

(defn get-candidates [grid row col]
  ; ...
  )

; ✅ CORRECT: Define helpers first, then use them
(defn get-candidates [grid row col]
  ; ...
  )

(defn apply-constraints [grid]
  (filter #(= (count (get-candidates grid %)) 1) cells))
```

**Solution:**
- Define all dependencies first in a file
- Use this pattern: helper functions → main functions → public API
- In solver.clj: `get-candidates` → `apply-naked-singles` → `apply-constraints` → `solve`

**Prevention:**
- Plan your file structure before writing code
- Put private helpers at top, public API at bottom
- Use `defn-` for private functions

---

### 2. Tuple Unpacking in Higher-Order Functions 🎯

**Issue**: When destructuring tuples in lambda functions passed to `map`/`filter`/`some`, must use double brackets.

```clojure
; ❌ WRONG: Single bracket = arity error
(some (fn [r c] (if-let [...] ...))
      (for [r (range 9) c (range 9)] [r c]))
; ArityException: clojure.lang.LazySeq cannot be cast to Number

; ✅ CORRECT: Double bracket for tuple unpacking
(some (fn [[r c]] (if-let [...] ...))
      (for [r (range 9) c (range 9)] [r c]))
```

**Why**: Each `[r c]` tuple is a single argument, so the function signature needs one parameter that destructures it.

**Prevention:**
- Always use `[[x y]]` for tuple destructuring in lambdas
- Test with multi-element sequences first
- Use `(fn [[x y z]] ...)` as standard pattern

---

### 3. Candidates Grid Caching for Performance 🚀

**Issue**: Recalculating candidate sets for each cell multiple times is inefficient. Original approach recalculated 81 times per iteration.

```clojure
; ❌ SLOW: Recalculates candidates repeatedly
(defn apply-naked-singles [grid]
  (reduce
   (fn [g [row col]]
     (let [candidates (get-candidates g row col)]  ; Calculated every time!
       (if (= (count candidates) 1)
         (assoc-in g [row col] (first candidates))
         g)))
   grid
   (for [r (range 9) c (range 9)] [r c])))

; ✅ FAST: Cache candidates grid first
(defn apply-naked-singles [grid]
  (let [candidates-grid 
        (mapv (fn [row-idx]
                (mapv (fn [col-idx]
                        (if (= (nth (nth grid row-idx) col-idx) 0)
                          (get-candidates grid row-idx col-idx)
                          #{}))
                      (range 9)))
              (range 9))]
    (reduce
     (fn [g [row col]]
       (let [candidates (nth (nth candidates-grid row) col)]
         (if (= (count candidates) 1)
           (let [new-row (vec (assoc (nth g row) col (first candidates)))]
             (assoc g row new-row))
           g)))
     grid
     (for [r (range 9) c (range 9)] [r c]))))
```

**Results**: ~15-20% performance improvement
- Before: 7.3ms per puzzle
- After: 6.2ms per puzzle

**When to use:**
- When a calculation is repeated multiple times
- Especially in tight loops (constraint propagation)
- Profile first to confirm bottleneck

---

### 4. Immutability Has Performance Overhead 📊

**Issue**: Every vector update creates a new vector. For large structures, this adds up.

```clojure
; ✅ GOOD: Use efficient operations
(assoc-in grid [row col] value)      ; Single update
(vec (assoc (nth grid row) col val)) ; Nested update

; ❌ SLOW: Multiple incremental updates
(reduce (fn [g [r c v]] (assoc-in g [r c] v))
        grid
        updates)  ; Creates new vector for each update

; ✅ BETTER: Batch updates when possible
(reduce conj base-collection items)  ; One reduction
```

**Prevention:**
- Use `reduce` for batch operations
- Avoid nested loops that modify structure
- Profile before claiming immutability is slow
- Cache computed values to avoid recalculation

---

### 5. Set Operations Performance 📈

**Issue**: `clojure.set/difference` on large sets is O(n), called repeatedly.

```clojure
; ❌ PROBLEM CODE (from solver)
(defn get-candidates [grid row col]
  (let [all-vals (set (range 1 10))
        row-vals (set (filter #(not= % 0) (get-row grid row)))
        col-vals (set (filter #(not= % 0) (get-column grid col)))
        box-vals (set (filter #(not= % 0) (get-box grid box-row box-col)))]
    (clojure.set/difference all-vals row-vals col-vals box-vals)))
```

**Bottleneck**: With 81 cells, this set difference is called 81 times per iteration × many iterations = thousands of set operations.

**Solution**: Use candidates grid caching (see pattern #3).

**Optimization Tips:**
1. Cache computed sets
2. Use `disj` for removing single values instead of `difference`
3. Use arrays/vectors for small sets (< 10 elements)
4. Profile with `(time ...)` to confirm improvement

```clojure
; ✅ FASTER: Disj single values
(reduce disj (set (range 1 10)) row-vals col-vals box-vals)
```

---

### 6. Invalid Test Data Causes Subtle Bugs 🐛

**Issue**: Using invalid puzzle strings (not exactly 81 digits) causes IndexOutOfBoundsException in grid operations.

```clojure
; ❌ WRONG: String too short, causes error deep in code
(analyze-puzzle "..3.2....8.....4...6.3.9.1")  ; Only 27 chars

; ✅ CORRECT: Full 81-character string
(analyze-puzzle "534678912672195348198342567859761423426853791713924856961537284287419635345286179")

; ✅ ALSO VALID: Load from real dataset
(let [puzzles (json/read-str (slurp "resources/puzzles/index00.json"))]
  (map analyze-puzzle (take 10 puzzles)))
```

**Prevention:**
- Validate puzzle string length: `(assert (= (count puzzle-str) 81))`
- Validate all characters are digits 0-9
- Use real test data from resources when possible
- Add input validation at function boundaries

---

### 7. Lazy Sequences and Memory Management 💾

**Issue**: Lazy sequences don't generate values until needed, but holding onto the sequence prevents garbage collection.

```clojure
; ❌ PROBLEM: Entire sequence held in memory
(let [all-puzzles (json/read-str (slurp "resources/puzzles/index00.json"))]
  (doseq [puzzle all-puzzles]
    (analyze-puzzle puzzle)))

; ✅ BETTER: Process in batches
(let [all-puzzles (json/read-str (slurp "resources/puzzles/index00.json"))]
  (doseq [batch (partition 100 all-puzzles)]
    (doseq [puzzle batch]
      (analyze-puzzle puzzle))))

; ✅ BEST: Use transducers for large datasets
(transduce (map analyze-puzzle)
           (completing (fn [_ p] (println p)))
           (json/read-str (slurp "resources/puzzles/index00.json")))
```

**When this matters:**
- Processing 1M+ item datasets
- Working with very large lazy sequences
- Real-time applications where memory is critical

**For small datasets (< 10k items):**
- Lazy sequences are fine, optimization not needed
- Use simple `doseq` or `map`

---

### 8. Recursion Depth and Stack Overflow ⚠️

**Issue**: Deep recursion without tail call optimization causes stack overflow.

```clojure
; ❌ WRONG: Not tail recursive (accumulator still on stack)
(defn factorial [n]
  (if (<= n 1)
    1
    (* n (factorial (dec n)))))

(factorial 5000)  ; StackOverflowException!

; ✅ CORRECT: Tail recursive with recur
(defn factorial [n acc]
  (if (<= n 1)
    acc
    (recur (dec n) (* n acc))))

(factorial 5000 1)  ; Works, no stack buildup

; ✅ ALSO CORRECT: Use loop/recur
(loop [n 5000 acc 1]
  (if (<= n 1)
    acc
    (recur (dec n) (* acc n))))
```

**Requirements for tail call optimization:**
- Must call `recur` (not the function name)
- Must be in the tail position (last thing evaluated)
- Works inside `fn`, `defn`, and `loop`

---

### 9. Testing Patterns for Functional Code 🧪

**Issue**: Testing pure functions is easy, but testing constraint propagation requires careful fixtures.

```clojure
; ✅ GOOD: Small test with real data
(deftest solve-single-puzzle
  (testing "Solver can solve a known puzzle"
    (let [puzzle "003020008800004006060309010304051087007805039018076203010609700700200100800710400"
          solution (solve puzzle)]
      (is (not (nil? solution)))
      (is (valid-solution? solution)))))

; ✅ GOOD: Test with multiple examples
(deftest solve-multiple-puzzles
  (testing "Solver handles diverse puzzles"
    (let [puzzles (json/read-str (slurp "resources/puzzles/index00.json"))
          solutions (map solve (take 5 puzzles))]
      (is (every? valid-solution? solutions)))))

; ✅ GOOD: Test edge cases
(deftest puzzle-parsing
  (testing "Parser converts puzzle string to grid"
    (let [puzzle "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
          grid (parse-puzzle puzzle)]
      (is (= (nth (nth grid 0) 0) 5))  ; Check specific cell
      (is (= (nth (nth grid 8) 8) 9)))))

; ❌ BAD: Hardcoded invalid data
(deftest bad-test
  (let [puzzle "..3.2....8....."]  ; Only 15 chars!
    (is (valid-solution? (solve puzzle)))))  ; IndexOutOfBoundsException
```

**Best Practices:**
- Load test data from resources/ directory
- Test with real puzzle strings (81 chars, all 0-9)
- Include edge cases: empty cells, filled cells, all states
- Validate fixtures before testing logic

---

### 10. UTF-8 BOM and Invisible Characters 📝

**Issue**: UTF-8 Byte Order Mark (BOM) at the start of `.clj` files causes parsing errors or unexpected behavior. Invisible Unicode characters in code can also break readers.

**Symptoms:**
- `FileNotFoundException` or reader errors when loading file
- Namespace (`ns`) form appears malformed or unrecognized
- REPL complains about illegal character at position 0
- Editor highlights invisible characters before `(ns ...)`

**What is UTF-8 BOM?**
A UTF-8 BOM is three invisible bytes (`0xEF 0xBB 0xBF`) that some editors prepend to UTF-8 files. While valid UTF-8, Clojure's reader doesn't expect them at the start of a source file.

```clojure
; ❌ WRONG: File starts with invisible BOM, then ns form
[BOM](ns my-app.core)  ; Reader sees garbage before (ns

; ✅ CORRECT: Clean UTF-8, no BOM
(ns my-app.core)
```

**Prevention:**

1. **Configure your editor** to save as UTF-8 without BOM:
   - **VS Code**: `"files.encoding": "utf8"` (default, no BOM)
   - **IntelliJ IDEA**: Settings → Editor → File Encodings → UTF-8 (will strip BOM on save)
   - **Emacs**: `(set-buffer-file-coding-system 'utf-8-unix)`
   - **Vim**: `:set fileencoding=utf-8 nobomb`

2. **CI/CD Check**: Scan for BOM before committing:
   ```bash
   # Check for BOM in .clj files
   file *.clj | grep -i "utf-8.*bom"
   ```

**How to Fix Existing Files**

**PowerShell (Windows):**
```powershell
$path = 'file.clj'
$content = [System.IO.File]::ReadAllText($path)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "✓ BOM removed from $path"
```

**Bash/Zsh (Unix/Linux/Mac):**
```bash
# Using sed to remove BOM
sed -i '1s/^\xef\xbb\xbf//' file.clj

# Or using a more portable method
printf '%s' "$(cat file.clj)" > file.clj
```

**VS Code:**
1. Open the affected `.clj` file
2. Look for indicator in bottom status bar: may show "UTF-8 with BOM"
3. Click on encoding indicator → choose "UTF-8" (without BOM)
4. File auto-converts on save

**Other Invisible Character Issues**

Beyond BOM, avoid these invisible characters in `.clj` files:
- Zero-width spaces (U+200B)
- Zero-width joiners (U+200D)
- Non-breaking spaces (U+00A0) — use regular space (U+0020)
- Other Unicode format characters (U+200E, U+200F, etc.)
- Control characters (ASCII 0-31, except tab/newline/carriage-return)

**Detection**

To check a file for invisible characters:

```bash
# Linux/Mac: Show all bytes
od -c file.clj | head -20

# PowerShell: Check first 3 bytes
$bytes = [System.IO.File]::ReadAllBytes('file.clj') | Select-Object -First 3
if ($bytes -join ' ' -eq '239 187 191') { Write-Host "BOM detected!" }
```

**Summary**
- Always save `.clj` files as **UTF-8 without BOM**
- Configure editor once, prevents issues across all projects
- If inherited files have BOM, use the removal scripts above
- Test with `lein test` after editing to confirm no reader errors

---

### 10. Common Patterns for Collection Transformations 🔄

**Pattern: Reduce for Accumulation**
```clojure
; Count specific values
(reduce (fn [counts val]
          (update counts val (fnil inc 0)))
        {}
        [1 2 2 3 3 3])
; {:1 1 :2 2 :3 3}

; Build nested structure
(reduce (fn [grid [r c v]]
          (assoc-in grid [r c] v))
        (vec (repeat 9 (vec (repeat 9 0))))
        updates)
```

**Pattern: Map + Filter Chain**
```clojure
; Standard pipeline
(->> (range 1 100)
     (filter odd?)
     (map #(* % 2))
     (take 5))
; (2 6 10 14 18)

; Thread-last (->>): Last arg position, use for sequences
; Thread-first (->): First arg position, use for objects
```

**Pattern: Group and Aggregate**
```clojure
; Group by category, then aggregate
(defn count-by-category [items]
  (->> items
       (group-by :category)
       (map (fn [[cat items]]
              [cat (count items)]))
       (into {})))
```

---

## Performance Debugging Checklist ✓

When code is slow:

1. **Measure with `time`**
   ```clojure
   (time (solve puzzle))
   ```

2. **Check for lazy sequence issues**
   - Ensure you're not holding onto large sequences
   - Use `take` or `partition` to process incrementally

3. **Profile hot loops**
   - Look for `map`/`filter`/`reduce` on large datasets
   - Check for repeated calculations
   - Consider caching or transducers

4. **Verify algorithm**
   - Is the algorithm O(n) or O(n²)?
   - Test on small inputs first
   - Compare against known working version

5. **Check memory usage**
   - Monitor for growing memory during iteration
   - Use `dotimes` instead of `map` for side effects

6. **Consider constraints**
   - Sudoku solver: constraint propagation is bottleneck (try hidden singles)
   - Data processing: immutability overhead (try batching)
   - String operations: regex can be slow (benchmark)

---

## Summary: Red Flags 🚩

These patterns indicate problems:

- ❌ Function used before defined → Reorganize file
- ❌ `fn [x y]` in higher-order function → Use `fn [[x y]]`
- ❌ Same calculation in loop → Cache with `let` or helper
- ❌ Test with invalid data → Use 81-char puzzle strings
- ❌ Very deep recursion → Use `loop`/`recur`
- ❌ Mysterious IndexOutOfBoundsException → Validate input length
- ❌ Memory growing unbounded → Don't hold lazy sequences
- ❌ Performance regression → Profile with `time` and cache

---

## References

- [Clojure Cheatsheet](https://clojure.org/api/cheatsheet)
- [Sudoku Solver Implementation](../../sudoku/sudoku-clj/src/sudoku_clj/solver.clj)
- [Performance Report](../../sudoku/sudoku-clj/PERFORMANCE.md)
