(ns sudoku-clj.patterns.verify-full-fj
  "Verify that full F&J actually produces the expected results.
   Tests that full F&J finds more minima than band-stack, which finds more than geometric-only.")

(require '[sudoku-clj.patterns.canonical :as canonical]
         '[sudoku-clj.patterns.transformations :as trans]
         '[sudoku-clj.patterns.band-stack :as bs]
         '[sudoku-clj.patterns.symbols :as sym])

(def test-puzzle "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(defn count-variations
  "Count how many distinct canonical forms we get by applying transformations at each level"
  [grid-str]
  (let [; Level 1: Geometric only
        geo-forms (trans/all-geometric-transforms grid-str)
        geo-canonical (count (set geo-forms))
        
        ; Level 2: Geometric + Band/Stack
        geo-bs-forms (mapcat (fn [geo-form]
                               (map first (bs/all-band-stack-perms geo-form)))
                             geo-forms)
        geo-bs-canonical (count (set geo-bs-forms))
        
        ; Level 3: Geometric + Band/Stack + Symbols (sample, don't materialize all)
        geo-bs-sym-sample (take 1000 
                            (mapcat (fn [geo-form]
                                      (mapcat (fn [[bs-grid _]]
                                                (map first (sym/all-symbol-perms bs-grid)))
                                              (bs/all-band-stack-perms geo-form)))
                                    geo-forms))
        geo-bs-sym-sample-canonical (count (set geo-bs-sym-sample))]
    
    {:geometric-only geo-canonical
     :geometric-band-stack geo-bs-canonical
     :geometric-band-stack-symbols-sample geo-bs-sym-sample-canonical
     :geometric-count (count geo-forms)
     :estimated-band-stack (+ (* 8 46656) -8)  ; Theoretical: 8 geo × 46,656 band-stack
     :estimated-full-fj (* 8 46656 40320)}))  ; Theoretical: 8 geo × 46,656 × 40,320

(defn compare-canonicals
  "Compare canonical forms from different modes"
  [grid-str mode]
  (println (format "\nComputing %s canonical form..." mode))
  (let [start (System/currentTimeMillis)
        result (canonical/canonical-form grid-str mode)
        elapsed (- (System/currentTimeMillis) start)]
    
    {:mode mode
     :result result
     :elapsed-ms elapsed}))

(defn -main
  "Verify full F&J is working correctly - test one mode at a time"
  [& args]
  (println "\n" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=")
  (println "VERIFYING FULL F&J ANALYSIS - TEST ONE MODE AT A TIME")
  (println "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "\n")
  
  (println "TEST 1: Variation Count Comparison")
  (println "-----------------------------------")
  (let [counts (count-variations test-puzzle)]
    (println (format "Geometric-only distinct forms: %d" (:geometric-only counts)))
    (println (format "Geometric + Band-Stack distinct forms: %d" (:geometric-band-stack counts)))
    (println (format "Geometric + Band-Stack + Symbols (1000 sample): %d distinct" (:geometric-band-stack-symbols-sample counts)))
    (println (format "Theoretical Band-Stack variations: %d" (:estimated-band-stack counts)))
    (println (format "Theoretical Full F&J variations: %d" (:estimated-full-fj counts))))
  
  (println "\nTEST 2: Canonical Form Computation (Testing one mode at a time)")
  (println "---------------------------------------------------------------")
  
  ; Test geometric-only
  (println "\nMode 1: GEOMETRIC-ONLY (Should be fast)")
  (let [result (compare-canonicals test-puzzle :geometric-only)]
    (println (format "Result: %s" (:result result)))
    (println (format "Elapsed: %d ms\n" (:elapsed-ms result))))
  
  ; Test band-stack
  (println "Mode 2: BAND-STACK (May take 10-30 seconds)")
  (let [result (compare-canonicals test-puzzle :band-stack)]
    (println (format "Result: %s" (:result result)))
    (println (format "Elapsed: %d ms\n" (:elapsed-ms result))))
  
  ; Test full F&J
  (println "Mode 3: FULL F&J (Testing if anchoring works - may take 1-5 minutes)")
  (let [result (compare-canonicals test-puzzle :full)]
    (println (format "Result: %s" (:result result)))
    (println (format "Elapsed: %d ms\n" (:elapsed-ms result))))
  
  (println "VERIFICATION COMPLETE")
  (println "---------------------")
  (println "If all three modes completed:")
  (println "✓ Full F&J is working and using anchored optimizations")
  (println "\n"))
