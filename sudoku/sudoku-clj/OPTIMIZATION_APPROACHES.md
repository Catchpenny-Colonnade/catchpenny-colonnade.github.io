# Optimization Approaches for Lower Clue Counts with Uniqueness

## Problem Statement

Current implementation generates puzzles with ~50 clues across all tiers because greedy random removal cannot identify safe clue removals that maintain uniqueness. Target clue counts require smarter removal strategies.

## Approach 1: Constraint-Aware Clue Selection

### Strategy
Instead of random clue removal, analyze puzzle structure to identify "safe" clue removals.

**Algorithm:**
1. After generating complete puzzle, identify constraint cells:
   - Cells that appear in multiple constraints (row/col/box)
   - Cells with redundant information
2. Prioritize removal of highly-constrained cells
3. Validate uniqueness after each removal

**Feasibility:**
- ⚠️ **Medium complexity:** Requires analysis layer
- ⚠️ **Moderate improvement:** Might reach 30-35 clues for medium tier
- ⚠️ **Performance:** Still O(n²) per puzzle due to `count-solutions` checks

### Implementation Sketch
```clojure
(defn score-clue-removability [puzzle-str idx]
  "Score how safe it is to remove clue at idx (higher = safer)"
  (let [row (quot idx 9)
        col (mod idx 9)
        box (+ (* 3 (quot row 3)) (quot col 3))
        ;; Count how many cells in row/col/box depend on this clue
        dependent-count (count-dependent-cells puzzle-str row col box)]
    (- dependent-count)))  ; Lower dependent count = safer to remove

(defn remove-clues-smart [puzzle-str target-clues]
  "Remove clues using constraint analysis instead of pure random"
  (loop [current puzzle-str remaining (count-clues puzzle-str)]
    (if (<= remaining target-clues)
      current
      (let [candidates (find-removable-clues current target-clues)
            scored (map (fn [idx] [idx (score-clue-removability current idx)]) candidates)
            best-idx (first (apply min-key second scored))]
        (recur (remove-clue current best-idx) (dec remaining))))))
```

**Pros:**
- Principled approach based on puzzle structure
- Likely to improve clue counts somewhat

**Cons:**
- Still fundamentally limited by uniqueness constraint
- Adds complexity
- Improvement may be marginal (might only reach 35-40 instead of 50)

---

## Approach 2: Backtracking-Aware Removal

### Strategy
Analyze solver's search tree to identify clues that cause branching, then prioritize their removal.

**Algorithm:**
1. Instrument solver to track which clues cause search branching
2. Identify "key" clues (removing them increases search tree significantly)
3. Try removing non-key clues first
4. Validate uniqueness

**Feasibility:**
- 🔴 **High complexity:** Requires solver instrumentation
- ⚠️ **Unknown improvement:** Theoretical but unproven approach
- 🔴 **Performance:** Major overhead (need to track solver decisions)

**Pros:**
- Based on solver behavior insight
- Could theoretically reach lower clue counts

**Cons:**
- Very complex to implement correctly
- High performance cost
- Uncertain if improvement justifies complexity

---

## Approach 3: Batch + Filter (Hybrid)

### Strategy
Generate many puzzles with solvability-only, then post-filter for uniqueness.

**Algorithm:**
1. Generate 100 solvable puzzles (fast, diverse clue counts)
2. Check each for uniqueness using `count-solutions`
3. Keep only unique ones
4. Discard non-unique ones

**Feasibility:**
- ✅ **Low complexity:** Minimal code changes
- ✅ **Fast implementation:** Can test immediately
- ⚠️ **Moderate improvement:** Might maintain better clue distribution
- ⚠️ **Unknown success rate:** Depends on % unique in solvable set

**Implementation Sketch:**
```clojure
(defn generate-unique-batch [count difficulty-tier]
  "Generate batch with solvability, filter for uniqueness"
  (let [solvable-batch (generate-solvable-batch (* count 3) difficulty-tier)]  ; 3x oversampling
    (->> solvable-batch
         (filter (fn [puzzle-map]
                   (= (count-solutions (:puzzle puzzle-map)) 1)))
         (take count))))
```

**Pros:**
- Simple to implement
- Can use existing solvability-only generator
- Fast validation loop

**Cons:**
- Success rate unknown (need empirical testing)
- May generate many non-unique puzzles (wasteful)
- Doesn't improve individual puzzle clue counts

---

## Approach 4: Multi-Phase Removal

### Strategy
Combine random removal with validation in phases, adjusting strategy based on feedback.

**Algorithm:**
1. **Phase 1 (aggressive):** Remove 50% of clues randomly, validate
2. **Phase 2 (cautious):** Remove 10% at a time with validation checks
3. **Phase 3 (targeted):** Switch to constraint-based removal if Phase 2 plateaus

**Feasibility:**
- ⚠️ **Medium complexity:** Hybrid approach
- ⚠️ **Modest improvement:** Better than current, worse than Approach 2
- ✅ **Reasonable performance:** Leverages current implementation

**Implementation Sketch:**
```clojure
(defn remove-clues-adaptive [puzzle-str target-clues max-attempts]
  "Remove clues with adaptive strategy"
  (let [initial-clues (count-clues puzzle-str)
        phase1-target (- initial-clues (quot (- initial-clues target-clues) 2))]
    ;; Phase 1: aggressive random removal
    (let [after-phase1 (remove-clues-greedily puzzle-str phase1-target max-attempts)]
      ;; Phase 2: fine-grained removal
      (remove-clues-cautiously after-phase1 target-clues max-attempts))))
```

**Pros:**
- Combines strengths of multiple approaches
- Incremental improvement

**Cons:**
- More complex logic
- Still limited by mathematical constraints

---

## Empirical Testing Plan

To determine which approach is worth pursuing:

### Test 1: Batch Success Rate (Approach 3)
```clojure
(defn test-batch-uniqueness-rate []
  "Test % of solvable puzzles that have unique solutions"
  (dotimes [trial 3]
    (let [solvable (generate-solvable-batch 100 :medium)
          unique-count (count (filter 
                               (fn [p] (= (count-solutions (:puzzle p)) 1))
                               solvable))]
      (println (format "Trial %d: %d%% unique" trial (quot (* unique-count 100) 100))))))
```

Expected result: If >30% unique, Approach 3 is viable.

### Test 2: Constraint Scoring (Approach 1)
```clojure
(defn test-constraint-removal []
  "Compare random vs constraint-based removal"
  (let [puzzle (generate-complete-puzzle)
        random-result (remove-clues-randomly puzzle 34)
        constraint-result (remove-clues-smart puzzle 34)]
    (println (format "Random: %d clues, Unique: %s"
                    (count-clues random-result)
                    (= (count-solutions random-result) 1)))
    (println (format "Smart: %d clues, Unique: %s"
                    (count-clues constraint-result)
                    (= (count-solutions constraint-result) 1)))))
```

Expected result: Measurable difference in clue counts?

---

## Recommendation Matrix

| Approach | Complexity | Improvement | Performance | Recommendation |
|----------|-----------|------------|-------------|-----------------|
| **1: Constraint-Aware** | Medium | +10-15 clues | Moderate | Try if time allows |
| **2: Backtracking-Aware** | High | +15-25 clues? | Poor | Not worth now |
| **3: Batch + Filter** | Low | +5-10 clues? | Good | **Test immediately** |
| **4: Multi-Phase** | Medium | +5-10 clues | Good | Consider after 3 |

### Immediate Action: Test Approach 3

**Why:** Minimal implementation effort, can validate concept quickly with current code.

**Implementation:**
1. Create `generate-solvable-batch` function (revert to solvability-only for this batch)
2. Filter results with uniqueness check
3. Run test on 100-puzzle batch
4. Measure clue distribution and success rate

**If >25% success rate:** Approach 3 is viable for production.
**If <10% success rate:** Mathematical constraints are real; accept Approach 1 (current).

---

## Mathematical Context

Why this is hard:

- **Known fact:** Minimum unique solution sudokus have ~16-17 clues theoretically
- **Reality:** 99%+ of puzzles with 20 clues have multiple solutions
- **In practice:** Unique-solution puzzles cluster around 20-30+ clues
- **Current state:** Random puzzles even more densely packed around 50 clues

This suggests optimization can improve, but won't reach extreme tier targets without fundamental algorithmic shifts.

---

## Decision Tree

```
Is current 50-clue generation acceptable?
├─ YES → Stop here. Tests pass. Ship it.
└─ NO → Need better clues?
    ├─ Test Approach 3 (Batch + Filter)
    │   ├─ Success >25%? → Use Approach 3, validate in production
    │   └─ Success <10%? → Approach 1 worth trying
    │
    └─ If Approach 3 fails → Evaluate Approach 1
        ├─ Improvement >5 clues? → Implement in production
        └─ Improvement <2 clues? → Accept current behavior
```

---

## Next Steps

1. **Immediate:** Implement Approach 3 test with batch filtering
2. **Quick win:** If >25% success, switch to hybrid batch generation
3. **If needed:** Implement Approach 1 (constraint analysis)
4. **Monitor:** Track real-world usage and difficulty feedback

**Estimated effort:**
- Approach 3: 30 minutes (test) + 1 hour (implementation)
- Approach 1: 4-6 hours (design + test + integrate)
- Approach 2: 10+ hours (risky, uncertain ROI)
