(ns sudoku-clj.patterns.validate
  "Quick validation of pattern modules before running full analysis"
  (:require [sudoku-clj.patterns.transformations :as trans]
            [sudoku-clj.patterns.canonical :as canonical]))

(defn validate-transforms
  "Test geometric transforms on a real puzzle"
  []
  (let [puzzle "004300209005009001070060043006002087190007400050083000600000105003508690042910300"
        transforms (trans/all-geometric-transforms puzzle)]
    (println "\n=== GEOMETRIC TRANSFORMS VALIDATION ===")
    (println (str "Original puzzle: " puzzle))
    (println (str "Number of unique transforms: " (count transforms)))
    (doseq [t (sort transforms)]
      (println (str "  " (subs t 0 20) "...")))
    (let [canonical (trans/find-lexicographically-smallest transforms)]
      (println (str "\nCanonical form: " canonical)))))

(defn validate-canonical-geometric
  "Test geometric + band/stack canonical form"
  []
  (let [puzzle "004300209005009001070060043006002087190007400050083000600000105003508690042910300"]
    (println "\n=== CANONICAL FORM VALIDATION ===")
    (println "Computing canonical form (geometric + band/stack)...")
    (let [start (System/currentTimeMillis)
          canonical (canonical/canonical-form puzzle)
          elapsed (- (System/currentTimeMillis) start)]
      (println (str "Canonical form: " canonical))
      (println (str "Computation time: " elapsed " ms")))))

(defn -main
  "Main validation entry point"
  [& args]
  (println "=== SUDOKU PATTERNS VALIDATION ===\n")
  (try
    (validate-transforms)
    (validate-canonical-geometric)
    (println "\n✓ All validations passed!")
    (catch Exception e
      (println (str "\n✗ Validation failed: " (.getMessage e)))
      (.printStackTrace e))))
