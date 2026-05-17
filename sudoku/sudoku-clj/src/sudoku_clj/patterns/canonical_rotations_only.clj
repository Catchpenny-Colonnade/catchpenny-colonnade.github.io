(ns sudoku-clj.patterns.canonical-rotations-only
  "Canonical form using ONLY rotations (no reflections).
   Tests hypothesis that flips are redundant with band/stack + symbol permutations.
   
   Uses 4 rotations instead of 8 geometric transforms:
   - Identity (0°)
   - Rotate 90°
   - Rotate 180°
   - Rotate 270°
   
   Skips all flips/reflections (horizontal, vertical, transpose, anti-transpose)")

(require '[sudoku-clj.patterns.transformations :as trans]
         '[sudoku-clj.patterns.band-stack :as bs]
         '[sudoku-clj.patterns.symbols :as sym])

(defn all-rotations-only
  "Return only the 4 rotations, not the 4 flips"
  [grid-str]
  [grid-str
   (trans/rotate-90 grid-str)
   (trans/rotate-180 grid-str)
   (trans/rotate-270 grid-str)])

(defn canonical-form-rotations-only
  "Find canonical form using ONLY rotations (no flips) + band-stack + symbols"
  [grid-str]
  (let [rotations (all-rotations-only grid-str)]
    (reduce 
      (fn [min-form rotation]
        (reduce 
          (fn [min-bs-form [bs-grid _]]
            (reduce 
              (fn [min-sym-form [sym-grid _]]
                (if (< (compare sym-grid min-sym-form) 0) sym-grid min-sym-form))
              min-bs-form
              (sym/all-symbol-perms bs-grid)))
          min-form
          (bs/all-band-stack-perms rotation)))
      (first rotations)
      (rest rotations))))

(defn canonical-form-band-stack-only
  "Find canonical form using ONLY rotations + band-stack (no symbols)"
  [grid-str]
  (let [rotations (all-rotations-only grid-str)
        all-forms (mapcat (fn [rotation]
                           (map first (bs/all-band-stack-perms rotation)))
                         rotations)]
    (trans/find-lexicographically-smallest all-forms)))

(defn canonical-form-rotations-geo-only
  "Find canonical form using ONLY rotations (no flips, no band-stack, no symbols)"
  [grid-str]
  (trans/find-lexicographically-smallest (all-rotations-only grid-str)))
