(ns sudoku-clj.solver-perf-test
  (:require [clojure.test :refer :all]
            [sudoku-clj.solver :refer :all]
            [clojure.data.json :as json]
            [clojure.java.io :as io]))

;; Performance and stress tests for the solver

(defn load-test-puzzles [index-name limit]
  "Load puzzles from JSON file, limit to first N puzzles"
  (let [file-path (format "resources/puzzles/%s.json" index-name)
        puzzles (json/read-str (slurp file-path))]
    (take limit puzzles)))

(deftest solver-performance-10-puzzles
  (testing "Solver can solve 10 different puzzles from index00"
    (let [puzzles (load-test-puzzles "index00" 10)
          start-time (System/currentTimeMillis)]
      (doseq [puzzle puzzles]
        (let [solution (solve puzzle)]
          (is (not (nil? solution)))
          (is (valid-solution? solution))))
      (let [elapsed (- (System/currentTimeMillis) start-time)]
        (println (format "Solved 10 puzzles in %dms (avg: %.1fms per puzzle)" 
                        elapsed 
                        (/ elapsed 10.0)))))))

(deftest solver-performance-100-puzzles
  (testing "Solver can solve 100 different puzzles from index00"
    (let [puzzles (load-test-puzzles "index00" 100)
          start-time (System/currentTimeMillis)]
      (doseq [puzzle puzzles]
        (let [solution (solve puzzle)]
          (is (not (nil? solution)))))
      (let [elapsed (- (System/currentTimeMillis) start-time)]
        (println (format "Solved 100 puzzles in %dms (avg: %.1fms per puzzle)" 
                        elapsed 
                        (/ elapsed 100.0)))))))

(deftest solver-performance-1000-puzzles
  (testing "Solver can solve 1000 different puzzles from index00"
    (let [puzzles (load-test-puzzles "index00" 1000)
          total-puzzles (count puzzles)
          start-time (System/currentTimeMillis)]
      (doseq [puzzle puzzles]
        (let [solution (solve puzzle)]
          (is (not (nil? solution)))))
      (let [elapsed (- (System/currentTimeMillis) start-time)]
        (println (format "Solved %d puzzles in %dms (avg: %.2fms per puzzle, ~%.0f puzzles/sec)" 
                        total-puzzles
                        elapsed 
                        (/ elapsed (double total-puzzles))
                        (/ (* total-puzzles 1000.0) elapsed)))))))

(deftest solver-performance-stress-multiple-files
  (testing "Solver can handle puzzles across multiple index files"
    (let [indices ["index00" "index01" "index02"]
          total-start (System/currentTimeMillis)]
      (doseq [index indices]
        (let [puzzles (load-test-puzzles index 10)
              start-time (System/currentTimeMillis)]
          (doseq [puzzle puzzles]
            (let [solution (solve puzzle)]
              (is (not (nil? solution)))))
          (let [elapsed (- (System/currentTimeMillis) start-time)]
            (println (format "  %s: 10 puzzles in %dms (avg: %.1fms per puzzle)" 
                            index elapsed (/ elapsed 10.0))))))
      (let [total-elapsed (- (System/currentTimeMillis) total-start)]
        (println (format "Total time for multi-file stress test: %dms" total-elapsed))))))

