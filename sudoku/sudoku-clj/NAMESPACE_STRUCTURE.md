# Canonical Pattern Analysis: Namespace Organization

## Recommended Structure

```
sudoku-clj/
├── src/sudoku_clj/
│   ├── (existing: core.clj, generator.clj, solver.clj, difficulty.clj, analysis.clj)
│   │
│   └── patterns/                          ← NEW NAMESPACE FOLDER
│       ├── canonical.clj                  ← Canonical form reduction
│       ├── transformations.clj            ← Rotations, reflections, permutations
│       ├── classifier.clj                 ← Difficulty classification
│       └── analysis.clj                   ← Grouping, statistics, reporting
│
├── test/sudoku_clj/
│   ├── (existing tests)
│   │
│   └── patterns/                          ← NEW TEST FOLDER
│       ├── canonical_test.clj
│       ├── transformations_test.clj
│       ├── classifier_test.clj
│       └── analysis_test.clj
│
└── resources/patterns/                    ← NEW DATA FOLDER
    ├── canonical-database.edn             ← Stored canonical patterns
    └── difficulty-index.edn               ← Difficulty classifications
```

## Namespace Breakdown

### 1. `sudoku-clj.patterns.canonical`
**Purpose:** Core canonical form reduction

```clojure
(ns sudoku-clj.patterns.canonical
  (:require [sudoku-clj.patterns.transformations :as tx]))

(defn to-canonical-form [puzzle-str]
  "Take any puzzle and return its canonical (smallest) representative form"
  ;; Implementation here
  )

(defn canonical-hash [puzzle-str]
  "Create stable hash for canonical form (for grouping)"
  ;; Implementation here
  )

(defn puzzles-equivalent? [puzzle-a puzzle-b]
  "Check if two puzzles reduce to same canonical form"
  ;; Implementation here
  )
```

### 2. `sudoku-clj.patterns.transformations`
**Purpose:** All transformation operations

```clojure
(ns sudoku-clj.patterns.transformations)

;; Rotations
(defn rotate-90 [puzzle-str] ...)
(defn rotate-180 [puzzle-str] ...)
(defn rotate-270 [puzzle-str] ...)

;; Reflections
(defn reflect-horizontal [puzzle-str] ...)
(defn reflect-vertical [puzzle-str] ...)

;; Symbol permutations
(defn permute-symbols [puzzle-str permutation] ...)
(defn random-symbol-permutation [puzzle-str] ...)

;; Band/Stack permutations
(defn permute-bands [puzzle-str band-order] ...)
(defn permute-stacks [puzzle-str stack-order] ...)
(defn random-band-permutation [puzzle-str] ...)
(defn random-stack-permutation [puzzle-str] ...)

;; Composite transformations
(defn apply-random-transformations [puzzle-str & {:keys [include-bands include-stacks]}] ...)
(defn generate-all-variations [puzzle-str] ...)  ;; For exhaustive analysis
```

### 3. `sudoku-clj.patterns.classifier`
**Purpose:** Difficulty classification of canonical forms

```clojure
(ns sudoku-clj.patterns.classifier
  (:require [sudoku-clj.generator :as gen]
            [sudoku-clj.patterns.canonical :as can]))

(defn test-clue-level [canonical-form target-clues]
  "Generate variant from canonical at specific clue level, test solvability"
  ;; Implementation
  )

(defn find-min-clues-for-unique [canonical-form]
  "Binary search: find minimum clues that maintains uniqueness"
  ;; Implementation
  )

(defn classify-difficulty [canonical-form]
  "Assign difficulty tier based on min clues required"
  ;; Returns :trivial, :easy, :medium, :hard, :extreme
  )

(defn classify-batch [canonical-forms]
  "Classify multiple canonical forms (parallelizable)"
  ;; Implementation
  )
```

### 4. `sudoku-clj.patterns.analysis`
**Purpose:** Grouping, statistics, and pattern discovery

```clojure
(ns sudoku-clj.patterns.analysis
  (:require [sudoku-clj.patterns.canonical :as can]
            [sudoku-clj.patterns.classifier :as clf]))

(defn group-by-canonical [puzzle-list]
  "Group puzzles by their canonical form"
  ;; Returns map {canonical [puzzles]}
  )

(defn analyze-clue-variance [canonical-form variants]
  "Check if clue counts vary within a canonical class"
  ;; Returns statistics
  )

(defn compute-canonical-statistics [puzzle-list]
  "Generate comprehensive analysis of canonical forms"
  ;; Returns report
  )

(defn save-canonical-database [canonical-map output-path]
  "Serialize canonical forms and metadata to file"
  ;; Implementation
  )

(defn load-canonical-database [path]
  "Load stored canonical patterns"
  ;; Implementation
  )

(defn generate-report [analysis-results]
  "Create human-readable report of findings"
  ;; Implementation
  )
```

## Import Hierarchy

```
transformations.clj (no dependencies on other pattern code)
       ↑
canonical.clj (uses transformations)
       ↑
classifier.clj (uses canonical, transformations)
       ↑
analysis.clj (uses all of the above)
```

## Test Organization

```clojure
; test/sudoku_clj/patterns/canonical_test.clj
(ns sudoku-clj.patterns.canonical-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.canonical :as can]))

(deftest test-to-canonical-form ...)
(deftest test-canonical-hash ...)
(deftest test-puzzles-equivalent? ...)

; test/sudoku_clj/patterns/transformations_test.clj
(ns sudoku-clj.patterns.transformations-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.patterns.transformations :as tx]))

(deftest test-rotate-90 ...)
(deftest test-reflect-horizontal ...)
; etc.
```

## Integration Points

### From existing code:
```clojure
; In sudoku-clj.generator, optionally use:
(require '[sudoku-clj.patterns.canonical :as can])
(require '[sudoku-clj.patterns.transformations :as tx])

; Example: Generate from canonical pattern
(defn generate-from-pattern [canonical-form difficulty]
  (let [variant (tx/apply-random-transformations canonical-form)
        puzzle (remove-clues variant (get-target-clues difficulty))]
    puzzle))
```

### New CLI commands:
```clojure
; In sudoku-clj.core, add:
(require '[sudoku-clj.patterns.analysis :as pan])

; lein run analyze-canonical <puzzle-count>
; lein run classify-patterns <database-path>
; lein run generate-from-pattern <pattern-id> <count> <difficulty>
```

## Suggested Implementation Order

1. **Week 1:** Implement `transformations.clj`
   - Start with rotation/reflection (simpler)
   - Add symbol permutation
   - Test thoroughly

2. **Week 1-2:** Implement `canonical.clj`
   - Canonical form reduction algorithm
   - Equivalence testing
   - Integration with transformations

3. **Week 2:** Implement `classifier.clj`
   - Clue level testing
   - Difficulty classification
   - Integration with existing generator/solver

4. **Week 2-3:** Implement `analysis.clj`
   - Grouping and statistics
   - Database serialization
   - Reporting

5. **Week 3:** Integration & Validation
   - CLI integration
   - Run full analysis on generated puzzles
   - Verify hypotheses

## File Structure Commands

To set this up:

```bash
# Create source folder
mkdir -p src/sudoku_clj/patterns

# Create test folder
mkdir -p test/sudoku_clj/patterns

# Create resources folder
mkdir -p resources/patterns

# Create empty namespace files
touch src/sudoku_clj/patterns/{canonical,transformations,classifier,analysis}.clj
touch test/sudoku_clj/patterns/{canonical,transformations,classifier,analysis}_test.clj
```

## Configuration

### In `project.clj`, ensure:

```clojure
:source-paths ["src"]
:test-paths ["test"]
:resource-paths ["resources"]
```

(These are usually defaults, but good to verify)

## Benefits of This Structure

✅ **Separation of Concerns:**
- Each namespace handles one logical piece
- Easy to test independently
- Easy to reuse in other projects

✅ **Clean Imports:**
- No circular dependencies
- Clear hierarchy
- Minimal coupling

✅ **Scalability:**
- Easy to add new transformation types
- Easy to add new analysis algorithms
- Easy to swap implementations

✅ **Maintainability:**
- Pattern code completely isolated from core generator
- Can disable/remove without breaking existing code
- Clear responsibility boundaries

✅ **Testing:**
- Each module has dedicated test file
- Can test transformations independently of analysis
- Easier to mock dependencies

## Alternative: Single File Approach

If you prefer keeping it simpler initially:

```
src/sudoku_clj/patterns.clj  (single file, all pattern code)
test/sudoku_clj/patterns_test.clj
```

**Trade-off:** Simpler initially, but will want to split into namespaces as code grows.

## Recommendation

**Use the multi-namespace folder approach** because:
1. Pattern analysis is substantial (~1000+ lines total)
2. Each component (transformations, canonical, classifier, analysis) is independently useful
3. Easier to parallelize development if needed
4. Sets good precedent for code organization
5. Easier to extract into separate library later if desired

---

Should I go ahead and create the basic namespace structure with stubs for all four modules?
