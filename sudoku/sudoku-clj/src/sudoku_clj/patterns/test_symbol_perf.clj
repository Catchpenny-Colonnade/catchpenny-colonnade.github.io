(ns sudoku-clj.patterns.test-symbol-perf
  "Test the performance of symbol permutation generation")

(require '[sudoku-clj.patterns.symbols :as sym]
         '[clojure.math.combinatorics :as combo])

(def test-grid "123456789456789123789123456214365897365897214897214365531642978642978531978531642")

(defn -main [& args]
  (println "\n=== Testing Symbol Permutation Generation Performance ===\n")
  
  ; Test 1: Generate permutations for a single grid
  (println "Test 1: Generate all symbol perms for one grid (40,320 variations)")
  (let [start (System/currentTimeMillis)
        perms (sym/all-symbol-perms test-grid)
        ; Count them by realizing the lazy seq
        count (count perms)
        elapsed (- (System/currentTimeMillis) start)]
    (println (format "Generated: %d permutations" count))
    (println (format "Time: %d ms" elapsed))
    (println (format "Per perm: %.2f microseconds\n" (/ (* elapsed 1000.0) count))))
  
  ; Test 2: Generate permutations many times (simulating what happens in full F&J)
  (println "Test 2: Generate symbol perms 100 times (simulating band-stack loop)")
  (let [start (System/currentTimeMillis)
        _ (doseq [i (range 100)]
            (let [perms (sym/all-symbol-perms test-grid)
                  _ (count perms)]  ; Force evaluation
              nil))
        elapsed (- (System/currentTimeMillis) start)]
    (println (format "Generated 100 × 40,320 = 4,032,000 permutations total"))
    (println (format "Time: %d ms" elapsed))
    (println (format "Per generation: %.2f ms\n" (/ elapsed 100.0))))
  
  ; Test 3: Materialize and count in different way
  (println "Test 3: Using doall to materialize (worst case)")
  (let [start (System/currentTimeMillis)
        perms (doall (sym/all-symbol-perms test-grid))
        elapsed (- (System/currentTimeMillis) start)]
    (println (format "Materialized: %d permutations" (count perms)))
    (println (format "Time: %d ms\n" elapsed)))
  
  (println "=== Test Complete ===\n"))
