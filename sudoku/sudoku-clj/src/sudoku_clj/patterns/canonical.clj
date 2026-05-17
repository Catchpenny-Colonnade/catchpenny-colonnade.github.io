(ns sudoku-clj.patterns.canonical
  "Find canonical form of a sudoku grid under full Felgenhauer & Jarvis equivalence.
   Applies geometric transforms, band/stack permutations, and symbol permutations.")

(require '[sudoku-clj.patterns.transformations :as trans]
         '[sudoku-clj.patterns.band-stack :as bs]
         '[sudoku-clj.patterns.symbols :as sym])

(defn canonical-form-geometric-only
  "Find canonical form using only geometric transforms (8 forms).
   Fastest, good for quick deduplication."
  [grid-str]
  (trans/find-lexicographically-smallest (trans/all-geometric-transforms grid-str)))

(defn canonical-form-with-band-stack
  "Find canonical form using geometric transforms AND band/stack permutations.
   Slower but more comprehensive (~1.67M variations per geometric form).
   Uses lazy evaluation to avoid memory explosion."
  [grid-str]
  (let [geo-forms (trans/all-geometric-transforms grid-str)
        all-forms (mapcat (fn [geo-form]
                           (map first (bs/all-band-stack-perms geo-form)))
                         geo-forms)]
    (trans/find-lexicographically-smallest all-forms)))

(defn canonical-form-full-felgenhauer-jarvis
  "Find canonical form using ALL equivalences:
   - 8 geometric transforms
   - Band/stack permutations (1.67M per geometric form)
   - Symbol permutations (362,880 per band/stack form)
   
   Uses STREAMING/LAZY evaluation to minimize memory usage.
   Processes variations one at a time, tracking only the minimum canonical form found so far."
  [grid-str]
  (let [geo-forms (trans/all-geometric-transforms grid-str)]
    ; Stream through all variations lazily, reducing to minimum
    (reduce 
      (fn [min-form geo-form]
        ; For each geometric transform, stream band/stack variations
        (reduce 
          (fn [min-bs-form [bs-grid _]]
            ; For each band/stack variation, stream symbol variations
            (reduce 
              (fn [min-sym-form [sym-grid _]]
                (if (< (compare sym-grid min-sym-form) 0) sym-grid min-sym-form))
              min-bs-form
              (sym/all-symbol-perms bs-grid)))
          min-form
          (bs/all-band-stack-perms geo-form)))
      (first geo-forms)
      (rest geo-forms))))

(defn canonical-form
  "Adaptive canonical form finder.
   Args: grid-str, and optional mode
   Modes: :full (complete F&J with symbol permutations)
          :geometric-only (8 transforms only, fastest)
          :band-stack (geometric + band/stack permutations, intermediate)
          default: geometric-only (fast baseline)"
  ([grid-str]
   (canonical-form-geometric-only grid-str))
  ([grid-str mode]
   (case mode
     :full (canonical-form-full-felgenhauer-jarvis grid-str)
     :geometric-only (canonical-form-geometric-only grid-str)
     :band-stack (canonical-form-with-band-stack grid-str)
     (canonical-form-geometric-only grid-str))))

(defn inverse-geometric-transform
  "Find which geometric transform was applied to get from original to transformed.
   Used for reconstruction: if we know canonical form, we can regenerate originals."
  [original transformed]
  ; Brute force: try all 8 and see which one matches
  (condp = transformed
    original :identity
    (trans/rotate-90 original) :rotate-90
    (trans/rotate-180 original) :rotate-180
    (trans/rotate-270 original) :rotate-270
    (trans/flip-horizontal original) :flip-horizontal
    (trans/flip-vertical original) :flip-vertical
    (trans/transpose original) :transpose
    (trans/anti-transpose original) :anti-transpose
    :unknown))
