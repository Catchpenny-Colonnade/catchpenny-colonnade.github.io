(ns sudoku-clj.patterns.test-fj-comparison
  "Test full F&J on ONE puzzle across all modes to verify canonical form progression"
  (:require [sudoku-clj.patterns.canonical :as canonical]))

(def puzzle1 "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(defn -main [& args]
  (println "\n=== Full F&J Canonical Form Progression Test ===")
  (println "Testing ONE puzzle across all equivalence levels\n")
  
  (println "Puzzle:")
  (println (format "%s\n" puzzle1))
  
  (println "Computing canonical forms at each level...")
  (println "(Should verify: full-F&J <= band-stack <= geometric-only)\n")
  
  ; Compute all three modes for the SAME puzzle
  (let [start-geo (System/currentTimeMillis)
        geo (canonical/canonical-form puzzle1 :geometric-only)
        time-geo (- (System/currentTimeMillis) start-geo)]
    
    (println "LEVEL 1: Geometric-only (8 transforms)")
    (println (format "Canonical: %s" geo))
    (println (format "Time: %d ms\n" time-geo))
    
    (let [start-bs (System/currentTimeMillis)
          bs (canonical/canonical-form puzzle1 :band-stack)
          time-bs (- (System/currentTimeMillis) start-bs)]
      
      (println "LEVEL 2: Band-stack (8 geo * 46656 band-stack perms)")
      (println (format "Canonical: %s" bs))
      (println (format "Time: %d ms" time-bs))
      (println (format "Smaller than geometric? %s" (< (compare bs geo) 0)))
      (println (format "Comparison result: %d\n" (compare bs geo)))
      
      ; Test full F&J (may time out)
      (println "LEVEL 3: Full F&J (8 geo * 46656 band-stack * 40320 symbol perms)")
      (try
        (let [start-fj (System/currentTimeMillis)
              fj (canonical/canonical-form puzzle1 :full)
              time-fj (- (System/currentTimeMillis) start-fj)]
          
          (println (format "Canonical: %s" fj))
          (println (format "Time: %d ms" time-fj))
          (println (format "Smaller than band-stack? %s" (< (compare fj bs) 0)))
          (println (format "Comparison result: %d\n" (compare fj bs)))
          
          ; Summary
          (println "VERIFICATION RESULTS:")
          (println "====================")
          (println (format "Full-F&J <= Band-stack? %s" (<= (compare fj bs) 0)))
          (println (format "Band-stack <= Geometric? %s" (<= (compare bs geo) 0)))
          (println (format "Full-F&J <= Geometric? %s" (<= (compare fj geo) 0)))
          
          (if (and (<= (compare fj bs) 0) (<= (compare bs geo) 0))
            (println "\nPASS: Canonical forms follow expected progression")
            (println "\nFAIL: Canonical forms do NOT follow expected progression")))
        
        (catch Exception e
          (println (format "ERROR: %s" (.getMessage e)))
          (println "\nFAIL: Full F&J could not complete\n")))))
  
  (println "\n=== Test Complete ===\n"))
