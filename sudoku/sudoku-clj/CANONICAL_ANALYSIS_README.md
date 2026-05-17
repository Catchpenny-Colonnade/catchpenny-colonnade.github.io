# Sudoku Canonical Form Analysis

Complete canonical form analysis system for detecting geometric equivalences in sudoku puzzles.

## Modules

- **transformations.clj**: 8 geometric transforms (rotations, reflections, transposition)
- **band_stack.clj**: Band/stack permutations (1.67M+ variations per puzzle)
- **symbols.clj**: Symbol permutations (9! = 362,880 relabelings)
- **canonical.clj**: Orchestrates canonical form computation with multiple modes
- **analyzer.clj**: Loads puzzle data and runs full deduplication analysis
- **validate.clj**: Quick validation of core modules before full analysis

## Running Analysis

### Option 1: Quick Validation (Recommended First)
Tests the basic modules to ensure they're working correctly:
```bash
cd sudoku/sudoku-clj
lein run -m sudoku-clj.patterns.validate
```
Expected output: All 8 geometric transforms identified, canonical form computed in ~20ms

### Option 2: Geometric-Only Analysis (Fast, ~2-5 minutes)
Analyzes puzzles using only geometric transforms (8 forms per puzzle):
```bash
cd sudoku/sudoku-clj
lein run -m sudoku-clj.patterns.run-analysis
```
- Speed: ~2-5 minutes for full dataset
- Coverage: Catches geometric duplicates (rotations, reflections)
- Output: `resources/analysis/dedup-report.edn`

### Option 3: Full Felgenhauer & Jarvis Analysis (Slow, 8-20 hours)
Complete mathematical equivalence including symbol relabeling:
```bash
cd sudoku/sudoku-clj
lein run -m sudoku-clj.patterns.run-analysis --full
```
- Speed: 8-20 hours for full dataset (depending on machine)
- Coverage: True mathematical equivalence (includes symbol permutations)
- Output: `resources/analysis/dedup-report.edn`

## Analysis Results

The analysis produces a report file: `resources/analysis/dedup-report.edn`

Report contains:
- `:total` - Total puzzles analyzed
- `:unique` - Number of unique canonical forms found
- `:duplicates` - Total number of duplicate puzzles
- `:duplicate-groups` - List of groups with >1 puzzle, showing:
  - `:canonical` - The canonical form
  - `:count` - Number of variants in this group
  - `:variants` - List of original puzzles in this group

Example:
```clojure
{:total 5000
 :unique 4850
 :duplicates 150
 :duplicate-groups
 [{:canonical "..." :count 3 :variants [{:file "index00.json" :idx 5 :grid "..."} ...]}
  ...]
 :analysis-params {:full false :mode "geometric"}}
```

## Performance Notes

**Geometric-only** (~2-5 min):
- 8 transforms per puzzle = very fast
- Sufficient for finding copy-paste duplicates
- Good for initial data quality assessment

**With Band/Stack** (~2-8 hours):
- 1.67M+ variations per geometric form = much slower
- Better coverage of structural equivalences
- Better insight into pattern redundancy

**Full Felgenhauer & Jarvis** (~8-20 hours):
- ~6 billion variations per puzzle total
- Theoretically complete equivalence
- Rarely needed for practical deduplication

## Next Steps

1. Run quick validation first
2. Run geometric-only analysis to get baseline duplicates
3. Review results in `resources/analysis/dedup-report.edn`
4. If significant duplicates found → Consider band/stack analysis
5. Use results to optimize web app storage
