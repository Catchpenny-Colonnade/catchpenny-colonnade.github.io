(ns sudoku-clj.patterns.test-single-bs-f-j
  "Test full F&J on just one band-stack form to measure actual performance")

(require '[sudoku-clj.patterns.canonical :as canonical]
         '[sudoku-clj.patterns.transformations :as trans]
         '[sudoku-clj.patterns.band-stack :as bs]
         '[sudoku-clj.patterns.symbols :as sym])

(def test-puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(defn -main [& args]
  (println "\n=== Testing Full F&J on Single Band-Stack Form ===\n")
  
  (let [geo-forms (trans/all-geometric-transforms test-puzzle)
        first-geo (first geo-forms)]
    
    (println "Step 1: Get first geometric form")
    (println (format "Geometric form: %s\n" first-geo))
    
    (println "Step 2: Count band-stack permutations (anchored)")
    (let [bs-perms (bs/all-band-stack-perms first-geo)
          bs-count (count bs-perms)]
      (println (format "Band-stack count: %d (should be 46,656)\n" bs-count)))
    
    (println "Step 3: Get first band-stack form and test symbol perms on it")
    (let [bs-perms (bs/all-band-stack-perms first-geo)
          first-bs-pair (first bs-perms)
          [first-bs _] first-bs-pair]
      (println (format "First band-stack form: %s" first-bs))
      
      (println "\nStep 4: Generate symbol perms for this band-stack (don't materialize)")
      (let [start (System/currentTimeMillis)
            sym-perms (sym/all-symbol-perms first-bs)
            ; Don't materialize - just count with reduce
            min-found (reduce 
                       (fn [min-sym-form [sym-grid _]]
                         (if (< (compare sym-grid min-sym-form) 0) sym-grid min-sym-form))
                       first-bs
                       sym-perms)
            elapsed (- (System/currentTimeMillis) start)]
        (println (format "Processed 40,320 symbol permutations without materializing"))
        (println (format "Time: %d ms" elapsed))
        (println (format "Min found: %s\n" min-found))))
    
    (println "Step 5: Now try full F&J on first geo form (8 geo × 46K band-stack × 40K symbols)")
    (let [start (System/currentTimeMillis)
          result (canonical/canonical-form-full-felgenhauer-jarvis test-puzzle)
          elapsed (- (System/currentTimeMillis) start)]
      (println (format "Full F&J result: %s" result))
      (println (format "Time: %d ms" elapsed))
      (println (format "Estimated for 1000 puzzles: %.1f seconds\n" (/ (* elapsed 1000) 1000.0))))
    
    (println "=== Test Complete ===\n")))
