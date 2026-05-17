(ns sudoku-clj.patterns.test-rotations-vs-full
  (:require [sudoku-clj.patterns.canonical :as canonical]
            [sudoku-clj.patterns.canonical-rotations-only :as rot]))

(def puzzle1 "123456789456789123789123456214365897365897214897214365531642978642978531978531642")
(def puzzle2 "192834567384756219756192384273641958618925743945378126829513674537264891461789235")
(def puzzle3 "417369825632158947859724136943215678286473519175896423594681752728539461361247895")

(defn compare-approach [puzzle]
  (println (str "\nPuzzle: " puzzle))
  (println "============================================================")
  
  (let [start-4 (System/currentTimeMillis)
        geo-4 (rot/canonical-form-rotations-geo-only puzzle)
        time-4 (- (System/currentTimeMillis) start-4)
        
        start-8 (System/currentTimeMillis)
        geo-8 (canonical/canonical-form puzzle :geometric-only)
        time-8 (- (System/currentTimeMillis) start-8)
        
        geo-same (= geo-4 geo-8)]
    
    (println "1. GEOMETRIC-ONLY COMPARISON")
    (println (str "   4 rotations only: " geo-4 " (time: " time-4 " ms)"))
    (println (str "   8 geometric full: " geo-8 " (time: " time-8 " ms)"))
    (println (str "   Same result? " geo-same)))
  
  (let [start-4 (System/currentTimeMillis)
        bs-4 (rot/canonical-form-band-stack-only puzzle)
        time-4 (- (System/currentTimeMillis) start-4)
        
        start-8 (System/currentTimeMillis)
        bs-8 (canonical/canonical-form puzzle :band-stack)
        time-8 (- (System/currentTimeMillis) start-8)
        
        bs-same (= bs-4 bs-8)]
    
    (println "\n2. BAND-STACK COMPARISON (geometric + band-stack)")
    (println (str "   4 rotations + BS: " bs-4 " (time: " time-4 " ms)"))
    (println (str "   8 geometric + BS: " bs-8 " (time: " time-8 " ms)"))
    (println (str "   Same result? " bs-same))
    
    (if (not bs-same)
      (println "   DIFFERENCE FOUND! Rotations-only misses something!"))))

(defn -main [& args]
  (println "\n==========================================================================================")
  (println "TESTING: Are geometric flips redundant?")
  (println "==========================================================================================")
  
  (compare-approach puzzle1)
  (compare-approach puzzle2)
  (compare-approach puzzle3)
  
  (println "\n==========================================================================================")
  (println "TEST COMPLETE")
  (println "=========================================================================================="))
